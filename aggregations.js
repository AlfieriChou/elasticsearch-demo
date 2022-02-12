const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9201' })

async function run() {
  const { body: indices } = await client.cat.indices({ format: 'json' })
  if (!indices.find(item => item.index === 'test')) {
    await client.indices.create({
      index: 'test',
      body: {
        mappings: {
          properties: {
            userId: { type: 'integer' },
            name: { type: 'keyword' },
            numericField: { type: 'integer' },
            date: { type: 'date' }
          }
        }
      }
    }, { ignore: [400] })

    const dataset = [{
      userId: 1,
      numericField: 2,
      name: 'hasan',
      date: new Date()
    }, {
      userId: 2,
      numericField: 3,
      name: 'veli',
      date: new Date()
    }, {
      userId: 3,
      numericField: 1,
      name: 'osman',
      date: new Date()
    }, {
      userId: 1,
      numericField: 3,
      name: 'hasan',
      date: new Date()
    }, {
      userId: 2,
      numericField: 5,
      name: 'veli',
      date: new Date()
    }, {
      userId: 3,
      numericField: 7,
      name: 'osman',
      date: new Date()
    }, {
      userId: 1,
      numericField: 5,
      name: 'hasan',
      date: new Date()
    }, {
      userId: 2,
      numericField: 8,
      name: 'veli',
      date: new Date()
    }, {
      userId: 3,
      numericField: 9,
      name: 'osman',
      date: new Date()
    }]

    const { body: bulkResponse } = await client.bulk({
      refresh: true,
      body: dataset
        .map(doc => [{ index: { _index: 'test' } }, doc])
        .reduce((ret, item) => ([...ret, ...item]), [])
    })

    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.reduce((ret, action, i) => {
        const [operation] = Object.keys(action)
        if (action[operation].error) {
          return [...ret, {
            status: action[operation].status,
            error: action[operation].error,
            operation: dataset[i],
            document: { index: { _index: 'test' } }
          }]
        }
        return ret
      }, [])
      console.error('error: ', erroredDocuments)
    }
  }

  // search
  const { body } = await client.search({
    index: 'test',
    size: 0,
    explain: true,
    body: {
      aggs: {
        user_agg: {
          terms: {
            field: 'name'
          },
          aggs: {
            // sum
            sum_agg: {
              sum: {
                field: 'numericField'
              }
            },
            // avg
            avg_agg: {
              avg: {
                field: 'numericField'
              }
            }
          }
        }
      }
    }
  })
  console.log(JSON.stringify(body, null, 2))
}

run().catch(console.log)
