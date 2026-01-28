import * as React from 'react'

export function useIsMac() {
  const [isMac, setIsMac] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    setIsMac(navigator.userAgent.includes('Mac'))
  }, [])

  return !!isMac
}
