import Queue from './queue.js'
import { Sleep } from '@libmedia/common/timer'
import { mutex, cond, ThreadId } from '@libmedia/cheap'

export default async function consumer(queue: pointer<Queue>) {

  const list  = accessof(addressof(queue.list))

  while (true) {
    mutex.lock(addressof(queue.mutex))
    while (!queue.list.length && !queue.endFlag) {
      cond.wait(addressof(queue.empty_cond), addressof(queue.mutex))
    }

    if (queue.endFlag) {
      mutex.unlock(addressof(queue.mutex))
      break
    }

    const now = list.shift()

    console.log(`consumer ${ThreadId} consume: ${now}`)

    cond.signal(addressof(queue.full_cond))
    mutex.unlock(addressof(queue.mutex))

    await new Sleep(Math.random())
  }
  return 0
}