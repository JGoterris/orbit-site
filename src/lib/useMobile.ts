import { useEffect, useState } from 'react'

const query = '(max-width: 759px)'

export function useMobile() {
  const [mobile, setMobile] = useState(() => matchMedia(query).matches)

  useEffect(() => {
    const mq = matchMedia(query)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mobile
}
