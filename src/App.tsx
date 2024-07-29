import React, { useEffect } from 'react'
import {Image, Table, Tab, Tabs, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Modal, useDisclosure, ModalContent, ModalBody, ModalHeader, Card } from '@nextui-org/react'
import './App.css'
import Papa from 'papaparse'

function App() {
  const [medals, setMedals] = React.useState<string[][]>([])
  const [medalsReversed, setMedalsReversed] = React.useState<string[][]>([])
  const [medalList, setMedalList] = React.useState<(string | number)[][]>()
  const [playerStat, setPlayerStat] = React.useState<Map<string, number[]>>()
  const [countryStat, setCountryStat] = React.useState<Map<string, number[]>>()
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const scrollBehavior = "inside";
  const [currentKey, setCurrentKey] = React.useState<string>('')
  const [currentStat, setCurrentStat] = React.useState<string[][]>([])

  useEffect(() => {
    fetch('/oly.csv')
      .then((response) => response.text())
      .then((data) => {
        setMedals(Papa.parse(data, { header: false }).data as string[][])
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }
    , [])

  useEffect(() => {
    if (medals.length > 0) {
      setMedalsReversed(medals.reverse().slice(1))
      const medalsData = []
      for (const medal of medals) {
        if (medal.length > 1) {
          let medalData = [1, medal[0], medal[1], medal[2]]
          medalsData.push(medalData)
          medalData = [2, medal[0], medal[3], medal[4]]
          medalsData.push(medalData)
          medalData = [3, medal[0], medal[5], medal[6]]
          medalsData.push(medalData)
        }
      }
      setMedalList(medalsData)
    }
  }
    , [medals])

  useEffect(() => {
    if (medalList) {
      const playersData = new Map<string, number[]>()
      const countriesData = new Map<string, number[]>()
      for (const medal of medalList) {
        if (playersData.has(medal[2] as string)) {
          const playerData = playersData.get(medal[2] as string)
          if (playerData) {
            playerData[medal[0] as number - 1]++
            playersData.set(medal[2] as string, playerData)
          }
        }
        else {
          const playerData = [0, 0, 0]
          playerData[medal[0] as number - 1]++
          playersData.set(medal[2] as string, playerData)
        }
        if (countriesData.has(medal[3] as string)) {
          const countryData = countriesData.get(medal[3] as string)
          if (countryData) {
            countryData[medal[0] as number - 1]++
            countriesData.set(medal[3] as string, countryData)
          }
        }
        else {
          const countryData = [0, 0, 0]
          countryData[medal[0] as number - 1]++
          countriesData.set(medal[3] as string, countryData)
        }
        setPlayerStat(playersData)
        setCountryStat(countriesData)
      }
    }
  }
    , [medalList])

  const columns = [
    { title: '排名', dataIndex: 0, key: 'rank' },
    { title: '名称', dataIndex: 1, key: 'name' },
    { title: '🥇', dataIndex: 2, key: 'gold' },
    { title: '🥈', dataIndex: 3, key: 'silver' },
    { title: '🥉', dataIndex: 4, key: 'bronze' },
    { title: '🏅', dataIndex: 5, key: 'total' },
  ]

  const medalModal = (key: string) => {
    console.log(key)
    setCurrentKey(key)
    const currentDatas = []
    for (const medal of medalList as (string | number)[][]) {
      const currentData = []
      if (medal[2] === key) {
        currentData.push(medal[0] === 1 ? '金牌🥇' : medal[0] === 2 ? '银牌🥈' : '铜牌🥉')
        currentData.push(medal[1])
        currentData.push(medal[3])
        currentDatas.push(currentData as string[])
      }
      if (medal[3] === key) {
        currentData.push(medal[0] === 1 ? '金牌🥇' : medal[0] === 2 ? '银牌🥈' : '铜牌🥉')
        currentData.push(medal[1])
        currentData.push(medal[2])
        currentDatas.push(currentData as string[])
      }
    }
    currentDatas.sort((a, b) => a[0] === '金牌🥇' ? -1 : a[0] === '银牌🥈' ? b[0] === '金牌🥇' ? 1 : -1 : 1)
    setCurrentStat(currentDatas)
    onOpen()
  }

  const medalTable: React.FC<{ stat: Map<string, number[]> }> = ({ stat }) => {
    const rows = []
    for (const [key, value] of stat) {
      const row = { key: key, name: key, gold: value[0], silver: value[1], bronze: value[2], total: value[0] + value[1] + value[2], rank: 0 }
      rows.push(row)
    }
    rows.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze)
    for (let i = 0; i < rows.length; i++) {
      rows[i].rank = i + 1
    }
    return (
      <Table isStriped onRowAction={(key) => medalModal(key as string)}>
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.title}</TableColumn>}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => <TableCell className='text-center'>{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  const eventColumns = [
    { title: '名称', dataIndex: 1, key: 'name' },
    { title: '🥇', dataIndex: 2, key: 'gold' },
    { title: '🥈', dataIndex: 3, key: 'silver' },
    { title: '🥉', dataIndex: 4, key: 'bronze' },
  ]

  const itemTable = (
    <Table isStriped>
      <TableHeader columns={eventColumns}>
        {(column) => <TableColumn key={column.key} className='text-center'>{column.title}</TableColumn>}
      </TableHeader>
      <TableBody items={medalsReversed}>
        {(item) => (
          <TableRow key={item[0]}>
            <TableCell className='text-center'> {item[0]} </TableCell>
            <TableCell className='text-center'> {item[1]} {item[2]} </TableCell>
            <TableCell className='text-center'> {item[3]} {item[4]} </TableCell>
            <TableCell className='text-center'> {item[5]} {item[6]} </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className='bg-[url(../317371.jpg)] justify-center flex'>
      <div className='w-max flex flex-col items-center max-w-[90vw]'>
        <Card className='py-2 m-4 w-full flex-row justify-center'>
          <Image src="/logo.png" height={"1.75rem"} />
          <h1 className="text-center text-lg px-2">南的奥运奖牌榜</h1>
        </Card>
        <Tabs color="primary">
          <Tab key="country" title="国家">{countryStat && medalTable({ stat: countryStat })}</Tab>
          <Tab key="athlete" title="运动员">{playerStat && medalTable({ stat: playerStat })}</Tab>
          <Tab key="item" title="项目">{itemTable}</Tab>
        </Tabs>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={scrollBehavior}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">{currentKey}</ModalHeader>
                <ModalBody className='mb-4'>
                  {currentStat.map((stat) => (
                    <div className="flex flex-row gap-1">
                      <div className="w-1/6 text-center">{stat[0]}</div>
                      <div className="w-1/2 text-center">{stat[1]}</div>
                      <div className="w-1/3 text-center">{stat[2]}</div>
                    </div>
                  ))}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}

export default App
