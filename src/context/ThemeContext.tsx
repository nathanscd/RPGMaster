import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'mystery' | 'medieval' | 'scifi'

const ThemeContext = createContext({
  theme: 'mystery' as Theme,
  setTheme: (t: Theme) => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('mystery')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)