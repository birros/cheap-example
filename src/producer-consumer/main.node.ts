import consumer from './consumerNode.js'
import producer from './producerNode.js'

import Queue from './queue.js'

import * as os from 'os'

import { Sleep } from '@libmedia/common/timer'
import { mutex, cond, createThreadFromFunction, joinThread } from '@libmedia/cheap'

import { Worker } from 'worker_threads'

async function run() {

  const queue = make<Queue>()

  queue.endFlag = 0
  queue.max = 7

  mutex.init(addressof(queue.mutex))
  cond.init(addressof(queue.empty_cond))
  cond.init(addressof(queue.full_cond))

  const produceThread = await createThreadFromFunction(producer, () => {
    return new Worker(new URL('./producerWorkerNode.js', import.meta.url)) as any
  }).run(addressof(queue))

  let consumerCount = 0
  consumerCount = os.cpus().length - 1
  
  const consumerThreads = await Promise.all(new Array(consumerCount).fill(0).map(() => {
    return createThreadFromFunction(consumer, () => {
      return new Worker(new URL('./consumerWorkerNode.js', import.meta.url)) as any
    }).run(addressof(queue))
  }))

  await new Sleep(30)

  queue.endFlag = 1
  cond.broadcast(addressof(queue.empty_cond))
  cond.broadcast(addressof(queue.full_cond))

  await joinThread(produceThread)

  await Promise.all(consumerThreads.map((thread) => {
    return joinThread(thread)
  }))

  mutex.destroy(addressof(queue.mutex))
  cond.destroy(addressof(queue.empty_cond))
  cond.destroy(addressof(queue.full_cond))

  queue.list.clear()

  unmake(queue)
}

run()