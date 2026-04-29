import {useEffect, useRef} from "react";


export function useAutoScroll<T>(deps:T[]) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  },deps)
  return scrollRef
}
