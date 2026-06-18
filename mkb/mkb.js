const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const viewer = require('prismarine-viewer')
const vec3 = require('vec3')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalFollow, GoalNear } = goals

let followTarget = null
let killauraEnabled = false
let guardPos = null
let guardInterval = null

const bot = mineflayer.createBot({
    
    host: 'GHFGHFGHFGGG.aternos.me',
    port: 47181,
    username: 'BOT',
    version: '1.12.2'
  })
  // Загрузка плагина pathfinder для навигации
bot.loadPlugin(pathfinder)
// Загрузка плагина pvp для боевых действий
bot.loadPlugin(pvp)
bot.on('spawn', () => {
  console.log('Бот зашёл на сервер')
  
})
bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: false })
  })
bot.on('chat', async (username, message) => {
  if (username === bot.username) return
  //  console.log(`Сообщение от ${username}: ${message}`)
  if (username === bot.username) return
  switch (message) {
    case 'help':
      bot.chat('Команды')
      bot.chat('help - список команд')
      bot.chat('list - инвентарь')
      bot.chat('dig - копать блок под собой')
      bot.chat('build - поставить блок под собой')
      bot.chat('equip <предмет> - взять предмет в руку')
      bot.chat('follow <ник> - следовать за игроком')
      bot.chat('chest - открыть сундук')
      bot.chat('killaura <on/off> - включить/выключить killaura')
      bot.chat('pech - открыть печку и показать её содержимое')
      bot.chat('smelt - плавить руду в печке')
      bot.chat('mine <название руды> - добыть руду')
      bot.chat('farmer - собирать созревшую пшеницу и сажать семена')
      bot.chat('fishing <on/off> - включить/выключить рыбалку')
      bot.chat('guard <on/off> - включить/выключить охрану территории')
      bot.chat('find <название блока> - найти блок')
      bot.chat('stop - остановиться')

      break
    case 'loaded':
      await bot.waitForChunksToLoad()
      bot.chat('Ready!')
      break
    case 'list':
      sayItems()
      break
    case 'dig':
      dig()
      break
    case 'build':
      build()
      break
    case 'equip':
      equipByName(args[1])
      break
    case 'pech':
      await openFurnace()
      break
    case 'smelt':
      await smelt()
      break
  }
  const args = message.split(' ')
  let killaura = false

bot.on('chat', (username, message) => {
if (message === 'killaura on') {
  toggleKillaura(true)
}
if (message === 'chest') {
  openChestAndSay()
}
if (message === 'killaura off') {
  toggleKillaura(false)
}
})
  if (args[0] === 'follow') {
    followTarget = args[1]
    bot.chat(`Иду за ${followTarget}`)
  }

  if (args[0] === 'equip') {
    equipByName(args[1])
  }

  if (args[0] === 'stop') {
    followTarget = null
    bot.pathfinder.setGoal(null)
    bot.chat('Остановился')
  }
  if (args[0] === 'mine') {
    await mineOre(args[1])
  }

  if (args[0] === 'farmer') {
    await farmer()
  }

  if (args[0] === 'fishing') {
    if (args[1] === 'on') {
      bot.chat('Рыбалка запущена')
      startFishing()
    }

    if (args[1] === 'off') {
      stopFishing()
    }
  }

  if (message === 'guard on') {
    startGuard(bot.entity.position.clone())
  }

  if (message === 'guard off') {
    stopGuard()
  }

  if (args[0] === 'find') {
    findBlockCoords(args[1])
  }

  if (message === 'coords') {
    sendBotCoords()
  }
})

// Функция для получения координат бота
function getBotCoords() {
  const { x, y, z } = bot.entity.position

  return {
    x: Math.floor(x),
    y: Math.floor(y),
    z: Math.floor(z)
  }
}

// Функция для отправки координат бота
function sendBotCoords() {
  const { x, y, z } = getBotCoords()
  bot.chat(`Мои координаты: X=${x} Y=${y} Z=${z}`)
}

// Функция для поиска координат блока
function findBlockCoords(blockName, maxDistance = 64) {
  const block = bot.findBlock({
    matching: (b) => b && b.name === blockName,
    maxDistance
  })

  if (!block) {
    bot.chat(`Блок ${blockName} не найден`)
    return null
  }

  const { x, y, z } = block.position

  bot.chat(`${blockName}: X=${x} Y=${y} Z=${z}`)

  return block.position
}

// Функция для рыбалки
let fishingEnabled = false
async function startFishing() {
  fishingEnabled = true

  while (fishingEnabled) {
    try {
      let rod = bot.inventory.items().find(
        item => item.name.includes('fishing_rod')
      )

      if (!rod) {
        bot.chat('Удочка не найдена')
        return
      }

      await bot.equip(rod, 'hand')

      await bot.fish()

      await bot.waitForTicks(20)
    } catch (err) {
      console.log(err)
      await bot.waitForTicks(40)
    }
  }
}
// Функция для остановки рыбалки
function stopFishing() {
  fishingEnabled = false
  bot.chat('Рыбалка остановлена')
}

// Функция для сбора и пересадки созревших культур
async function farmer(radius = 32) {
  const cropsMap = {
    wheat: 'wheat_seeds',
    carrots: 'carrot',
    potatoes: 'potato',
    beetroot: 'beetroot_seeds'
  }

  const cropPositions = bot.findBlocks({
    matching: block => {
      if (!block) return false

      return (
        (block.name === 'wheat' && block.metadata === 7) ||
        (block.name === 'carrots' && block.metadata === 7) ||
        (block.name === 'potatoes' && block.metadata === 7) ||
        (block.name === 'beetroots' && block.metadata === 3)
      )
    },
    maxDistance: radius,
    count: 1000
  })

  if (!cropPositions.length) {
    bot.chat('Созревшие культуры не найдены')
    return
  }

  for (const pos of cropPositions) {
    try {
      const crop = bot.blockAt(pos)
      if (!crop) continue

      const cropName = crop.name
      const seedName = cropsMap[cropName]

      await bot.pathfinder.goto(
        new goals.GoalNear(pos.x, pos.y, pos.z, 1)
      )

      await bot.dig(crop)

      await bot.waitForTicks(5)

      const seedItem = bot.inventory.items().find(
        item => item.name === seedName
      )

      if (!seedItem) continue

      const farmland = bot.blockAt(pos.offset(0, -1, 0))
      if (!farmland) continue

      await bot.equip(seedItem, 'hand')

      await bot.placeBlock(farmland, { x: 0, y: 1, z: 0 })

      await bot.waitForTicks(2)
    } catch (err) {
      console.log(`Ошибка на ${pos}:`, err.message)
    }
  }

  bot.chat('Все культуры собраны и пересажены')
}

// Функция для остановки охраны территории
function stopGuard() {
  if (guardInterval) {
    clearInterval(guardInterval)
    guardInterval = null
  }

  bot.pvp.stop()
  guardPos = null

  bot.chat('Охрана территории выключена')
}

// Функция для включения охраны территории
function startGuard(position) {
  guardPos = position

  if (guardInterval) clearInterval(guardInterval)

  bot.chat('Охрана территории включена')

  guardInterval = setInterval(async () => {
    try {
      const target = getNearestHostile()

      if (target) {
        bot.pvp.attack(target)
        return
      }

      if (
        guardPos &&
        bot.entity.position.distanceTo(guardPos) > 5
      ) {
        await bot.pathfinder.goto(
          new goals.GoalNear(
            guardPos.x,
            guardPos.y,
            guardPos.z,
            2
          )
        )
      }
    } catch {}
  }, 1000)
}

// Функция для получения ближайшего враждебного моба
function getNearestHostile() {
  const hostileMobs = [
    'zombie',
    'husk',
    'drowned',
    'skeleton',
    'stray',
    'creeper',
    'spider',
    'cave_spider',
    'witch',
    'enderman',
    'slime',
    'magma_cube',
    'phantom',
    'pillager',
    'vindicator',
    'evoker',
    'ravager'
  ]

  return bot.nearestEntity(entity => {
    return (
      entity.type === 'mob' &&
      hostileMobs.includes(entity.name) &&
      entity.position.distanceTo(guardPos) < 20
    )
  })
}

// Функция для добычи руды по названию
async function mineOre(oreName) {
  const block = bot.findBlock({
    matching: block =>
      block && block.name.includes(oreName.toLowerCase()),
    maxDistance: 64
  })

  if (!block) {
    bot.chat(`Не найдено: ${oreName}`)
    return
  }

  try {
    await bot.pathfinder.goto(
      new goals.GoalNear(block.position.x, block.position.y, block.position.z, 1)
    )

    await bot.dig(block)

    bot.chat(`${oreName} добыт`)
  } catch (err) {
    console.log(err)
  }
}

// Функция для открытия печки и вывода её содержимого в чат
async function openFurnace() {
  const furnaceBlock = bot.findBlock({
    matching: b => b.name === 'furnace',
    maxDistance: 15
  })

  if (!furnaceBlock) {
    bot.chat('Печка не найдена')
    return
  }

  await bot.waitForChunksToLoad()

  const pos = furnaceBlock.position

  bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1))

  await new Promise(resolve => {
    const interval = setInterval(() => {
      const dist = bot.entity.position.distanceTo(pos)

      if (dist < 2.5) {
        clearInterval(interval)
        resolve()
      }
    }, 200)
  })

  try {
    const furnace = await bot.openFurnace(furnaceBlock)

    bot.chat('Печка открыта')

    console.log({
      input: furnace.inputItem(),
      fuel: furnace.fuelItem(),
      output: furnace.outputItem()
    })

    furnace.close()

    bot.chat('Печка закрыта')
  } catch (err) {
    console.log(err)
    bot.chat('Ошибка открытия печки')
  }
}
// Функция для плавки руды в печке
async function smelt() {
  const furnaceBlock = bot.findBlock({
    matching: b => b.name === 'furnace',
    maxDistance: 15
  })

  if (!furnaceBlock) {
    bot.chat('Печка не найдена')
    return
  }

  await bot.waitForChunksToLoad()

  const pos = furnaceBlock.position

  bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 1))

  await new Promise(resolve => {
    const interval = setInterval(() => {
      const dist = bot.entity.position.distanceTo(pos)
      if (dist < 2.5) {
        clearInterval(interval)
        resolve()
      }
    }, 200)
  })

  let furnace
  try {
    furnace = await bot.openFurnace(furnaceBlock)
  } catch (e) {
    bot.chat('Не смог открыть печку')
    return
  }


  const smeltables = [
    'iron_ore',
    'gold_ore',
    'raw_beef',
    'raw_porkchop',
    'raw_chicken',
    'raw_mutton',
    'raw_rabbit'
  ]

  const fuelNames = ['coal', 'charcoal']

  while (true) {
    const item = bot.inventory.items().find(i =>
      smeltables.includes(i.name)
    )

    if (!item) {
      bot.chat('Нечего мне  плавить иди добывай руду')
      furnace.close()
      return
    }

    const fuel = bot.inventory.items().find(i =>
      fuelNames.includes(i.name)
    )

    if (!fuel) {
      bot.chat('Нету дизиля для плавки, иди добывай уголь')
      furnace.close()
      return
    }

    try {
      await furnace.putFuel(fuel.type, null, 1)
      await furnace.putInput(item.type, null, 1)

      bot.chat(`переплавляю ${item.name}`)

      // ждём результат
      while (!furnace.outputItem()) {
        await bot.waitForTicks(20)
      }

      await furnace.takeOutput()

      bot.chat('хахах,я переплавил железо')

    } catch (e) {
      console.log(e)
      furnace.close()
      return
    }}}
// Функция для открытия сундука и вывода его содержимого в чат
async function openChestAndSay() {
  const chest = bot.findBlock({
    matching: b => b && b.name.includes('chest'),
    maxDistance: 4
  })

  if (!chest) {
    bot.chat('Сундук не найден')
    return
  }

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(chest.position.x, chest.position.y, chest.position.z))

    const container = await bot.openContainer(chest)

    const items = container.containerItems()

    if (!items.length) {
      bot.chat('Сундук пустой')
    } else {
      const text = items
        .map(i => `${i.name} x${i.count}`)
        .join(', ')

      bot.chat(`В сундуке: ${text}`)
    }

    container.close()

  } catch (err) {
    console.log(err)
    bot.chat('Ошибка при открытии сундука')
  }
}

setInterval(() => {
  if (!followTarget) return

  const player = bot.players[followTarget]?.entity
  if (!player) return

  const door = bot.findBlock({
  matching: (block) => block.name.includes('door'),
  maxDistance: 3
  })

  if (door) {
    bot.activateBlock(door)
  }
  bot.pathfinder.setGoal(new GoalFollow(player, 1), true)
}, 5000)
// Функция для отображения инвентаря в чате
function sayItems (items = bot.inventory.items()) {
    const output = items.map(itemToString).join(', ')
    if (output) {
      bot.chat(output)
    } else {
      bot.chat('empty')
    }
  }
  
//  Функция для экипировки лучшего инструмента для данного блока
  async function equipBestToolForBlock(block) {
    if (!block) return
  
    const tools = bot.inventory.items().filter(item =>
      item.name.includes('pickaxe') ||
      item.name.includes('axe') ||
      item.name.includes('shovel') ||
      item.name.includes('sword')
    )
  
    if (tools.length === 0) return
  
    
    let bestTool = null
    let bestScore = -1
  
    for (const tool of tools) {
      const score = block.digTime(tool) 
      if (bestScore === -1 || score < bestScore) {
        bestScore = score
        bestTool = tool
      }
    }
  
    if (bestTool) {
      await bot.equip(bestTool, 'hand')
      bot.chat(`Использую ${bestTool.name}`)
    }
  }
  // Функция для копания блока под собой
  async function dig () {
    let target
  
    if (bot.targetDigBlock) {
      bot.chat(`already digging ${bot.targetDigBlock.name}`)
      return
    }
  
    target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  
    if (target && bot.canDigBlock(target)) {
      bot.chat(`starting to dig ${target.name}`)
  
      try {
        await equipBestToolForBlock(target) 
        await bot.dig(target)
        bot.chat(`finished digging ${target.name}`)
      } catch (err) {
        console.log(err.stack)
        bot.chat('error while digging')
      }
    } else {
      bot.chat('cannot dig')
    }
  }
    // Функция для строительства блока под собой
  function build () {
    const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    const jumpY = Math.floor(bot.entity.position.y) + 1.0
    bot.setControlState('jump', true)
    bot.on('move', placeIfHighEnough)
  
    let tryCount = 0
    // Проверяем, достаточно ли высоко прыгнул бот для установки блока
    async function placeIfHighEnough () {
      if (bot.entity.position.y > jumpY) {
        try {
          await bot.placeBlock(referenceBlock, vec3(0, 1, 0))
          bot.setControlState('jump', false)
          bot.removeListener('move', placeIfHighEnough)
          bot.chat('Placing a block was successful')
        } catch (err) {
          tryCount++
          if (tryCount > 10) {
            bot.chat(err.message)
            bot.setControlState('jump', false)
            bot.removeListener('move', placeIfHighEnough)
          }
        }
      }
    }
  }
// Функция для поиска блока, на который можно посадить семена
function blockToSow () {
  return bot.findBlock({
    point: bot.entity.position,
    matching: bot.registry.blocksByName.farmland.id,
    maxDistance: 6,
    useExtraInfo: (block) => {
      const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
      return !blockAbove || blockAbove.type === 0
    }
  })
}
// Функция для поиска созревшего блока пшеницы
function blockToHarvest () {
  return bot.findBlock({
    point: bot.entity.position,
    maxDistance: 6,
    matching: (block) => {
      return block && block.type === bot.registry.blocksByName.wheat.id && block.metadata === 7
    }
  })
}
// Основной цикл: сначала собираем, потом сажаем
async function loop () {
  try {
    while (1) {
      const toHarvest = blockToHarvest()
      if (toHarvest) {
        await bot.dig(toHarvest)
      } else {
        break
      }
    }
    while (1) {
      const toSow = blockToSow()
      if (toSow) {
        await bot.equip(bot.registry.itemsByName.wheat_seeds.id, 'hand')
        await bot.placeBlock(toSow, new Vec3(0, 1, 0))
      } else {
        break
      }
    }
  } catch (e) {
    console.log(e)
  }

  setTimeout(loop, 1000)
}

// Функция для экипировки предмета по названию
async function equipByName (name) {
    const item = bot.inventory.items().find(item =>
      item.name.includes(name)
    )
  
    if (!item) {
      bot.chat('Нет такого предмета')
      return
    }
  
    await bot.equip(item, 'hand')
    bot.chat(`Взял ${item.name}`)
  }

function toggleKillaura(state) {
    killauraEnabled = state
    bot.chat(state ? 'KillAura ON' : 'KillAura OFF')
  }
setInterval(() => {
  if (!killauraEnabled) return

  const target = bot.nearestEntity(entity => {
    return (
      entity.type === 'mob' ||
      (entity.type === 'player' && entity.username !== bot.username)
    )
  })

  if (!target) return

  const distance = bot.entity.position.distanceTo(target.position)

  // смотрим на цель
  bot.lookAt(
    target.position.offset(0, target.height, 0),
    true
  )

  // бьём если близко
  if (distance < 4) {
    bot.attack(target)
  }
}, 200)

// Функция для преобразования предмета в строку
function itemToString (item) {
    if (item) {
      return `${item.name} x ${item.count}`
    } else {
      return '(nothing)'
    }
}
bot.on('error', (err) => {
  console.log('Ошибка:', err)
})

bot.on('kicked', (reason) => {
  console.log('Кикнули:', reason)
})

