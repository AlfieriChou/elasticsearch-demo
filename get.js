const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://127.0.0.1:9201'
})

const start = async () => {
  await client.index({
    index: 'tweets',
    id: '1',
    body: {
      character: 'Ned Stark',
      quote: 'Winter is coming.'
    }
  })
  
  const ret = await client.get({
    index: 'tweets',
    id: '1'
  })
  console.log(ret)
}

start()
