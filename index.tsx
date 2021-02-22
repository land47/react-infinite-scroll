import React, {FC, memo, useEffect, useRef, useCallback, useState} from 'react'

let getChildrenByOffset = (
  node: HTMLElement,
  offset: number
) => node.children[node.childElementCount - (-offset)] || node.children[0]

type Props = {
  fetchMore: () => unknown,
  threshold?: number
}

export let InfiniteScroll: FC<Props> = memo(
  function InfiniteScroll({
    children,
    fetchMore,
    threshold = 10,
  }) {
    let container = useRef<HTMLDivElement>()
    let [target, setTarget] = useState<Element | null>(null)

    let getDefaultTarget = useCallback(() => getChildrenByOffset(
      container.current, -threshold
    ), [container.current, threshold])

    let intersectionListener = useCallback((entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        fetchMore()
      }
    }, [])

    useEffect(() => {
      let observer = new MutationObserver(
        () => setTarget(getDefaultTarget())
      )

      observer.observe(container.current, {
        childList: true
      })

      return () => observer.disconnect()
    }, [])

    useEffect(() => {
      let observer = new IntersectionObserver(intersectionListener, {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      })

      let _target = target || getDefaultTarget()
      observer.observe(_target)
      return () => observer.unobserve(_target)
    }, [target])

    return <div ref={container}>
      {children}
    </div>
  }
)
