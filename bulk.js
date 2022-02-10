const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://127.0.0.1:9201'
})

const run = async () => {
  const { body: indices } = await client.cat.indices({ format: 'json' })
  if (!indices.find(item => item.index === 'tweets')) {
    await client.indices.create({
      index: 'tweets',
      body: {
        mappings: {
          properties: {
            id: { type: 'integer' },
            text: { type: 'text' },
            user: { type: 'keyword' },
            time: { type: 'date' }
          }
        }
      }
    }, { ignore: [400] })
  }

  const dataset = [{
    id: 1,
    text: 'If I fall, don\'t bring me back.',
    user: 'jon',
    date: new Date()
  }, {
    id: 2,
    text: 'Witer is coming',
    user: 'ned',
    date: new Date()
  }, {
    id: 3,
    text: 'A Lannister always pays his debts.',
    user: 'tyrion',
    date: new Date()
  }, {
    id: 4,
    text: 'I am the blood of the dragon.',
    user: 'daenerys',
    date: new Date()
  }, {
    id: 5, // change this value to a string to see the bulk response with errors
    text: 'A girl is Arya Stark of Winterfell. And I\'m going home.',
    user: 'arya',
    date: new Date()
  }]

  const body = dataset
    .map(doc => [{ index: { _index: 'tweets' } }, doc])
    .reduce((ret, item) => ([...ret, ...item]), [])

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    
    bulkResponse.items.forEach((action, i) => {
      const [operation] = Object.keys(action)
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: 'tweets' })
  console.log(count)
}

run().catch(console.log)
