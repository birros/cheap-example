import wasmFile from './main.wasm'
import { compileResource, WebAssemblyRunner  } from '@libmedia/cheap'

@struct
class Data {
  a: int32
  b: int32
  sum: int32
}

async function run() {

  const resource = await compileResource(
    {
      source: wasmFile
    }
  )

  const runner = new WebAssemblyRunner(resource)
  await runner.run()

  const data = make<Data>({
    a: 3,
    b: 7
  })

  runner.invoke('interoperate', addressof(data))

  console.log(`js a: ${data.a}, b: ${data.b}, sum: ${data.sum}`)

  unmake(data)
  runner.destroy()
}

run()