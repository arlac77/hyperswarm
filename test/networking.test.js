'use strict'

const { test } = require('tap')
const { once, promisifyMethod } = require('./util')
const network = require('../')
const net = require('net')

test('connect directly', async ({ pass, same, is }) => {
  const swarm = network()
  promisifyMethod(swarm, 'listen')
  await swarm.listen()
  const { port } = swarm.address()
  const client = net.connect(port)
  const [ connection, info ] = await once(swarm, 'connection')
  pass('server connected')
  once(client, 'connect')
  pass('client connected')
  is(info.type, 'tcp')
  client.write('a')
  const [ data ] = await once(connection, 'data')
  same(data, Buffer.from('a'))
  connection.destroy()
  await once(connection, 'close')
  pass('server disconnected')
  await once(client, 'close')
  pass('client disconnected')
  swarm.destroy()
  await once(swarm, 'close')
  pass('swarm closed')
})
