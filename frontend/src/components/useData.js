import { useContext } from 'react'
import { DataContext } from './DataProvider'

export const useData = () => useContext(DataContext)