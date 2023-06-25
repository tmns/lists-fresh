import { VNode } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { Circles } from 'react-loading-icons'

interface LoadingIndicatorProps {
  isLoading: boolean
  children: VNode
  styles?: { width?: string; height?: string }
}

export default function LoadingIndicator(props: LoadingIndicatorProps) {
  const [shouldShowIndicator, setShouldShowIndicator] = useState(false)
  const cachedTimeout = useRef<number>()

  useEffect(() => {
    if (!props.isLoading) {
      setShouldShowIndicator(false)
      if (cachedTimeout.current) clearTimeout(cachedTimeout.current)
    } else {
      cachedTimeout.current = setTimeout(() => setShouldShowIndicator(true), 400)
    }
  }, [props.isLoading])

  const width = props.styles?.width || '1rem'
  const height = props.styles?.height || '1rem'

  return shouldShowIndicator ? <Circles {...{ width, height }} /> : props.children
}
