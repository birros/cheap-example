import Queue from './queue.js'
import { Sleep } from '@libmedia/common/timer'
import { mutex, cond, ThreadId } from '@libmedia/cheap'

export default async function producer(queue: pointer<Queue>) {

  let item: int32 = 0

  const list = accessof(addressof(queue.list))

  while (true) {

    mutex.lock(addressof(queue.mutex))
    while (queue.list.length === queue.max && !queue.endFlag) {
     cond. wait(addressof(queue.full_cond), addressof(queue.mutex))
    }

    if (queue.endFlag) {
      mutex.unlock(addressof(queue.mutex))
      break
    }

    const now = item++

    console.log(`producer ${ThreadId} produce: ${now}`)

    list.push(now)

    cond.signal(addressof(queue.empty_cond))
    mutex.unlock(addressof(queue.mutex))

    await new Sleep(Math.random())
  }
  return 0
}