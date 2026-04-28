export async function readStream(response: Response, onMessage: (data: any) => void, onDone?: () => void,onError?: (err: any) => void) {
  try {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder("utf-8")

    if (!reader) {
      throw new Error("浏览器不支持流读取")
    }

    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onDone && onDone()
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split("\n")

      // 留最后一段（防止半截 JSON）
      buffer = lines.pop() || ""

      for (let line of lines) {
        if (!line.startsWith("data: ")) continue

        const dataStr = line.replace("data: ", "").trim()

        if (dataStr === "[DONE]") {
          onDone && onDone()
          return
        }

        try {
          const parsed = JSON.parse(dataStr)
          onMessage(parsed)
        } catch (e) {
          console.warn("JSON解析失败:", dataStr)
        }
      }
    }
  } catch (err) {
    onError && onError(err)
  }
}
