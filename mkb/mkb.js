const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const viewer = require('prismarine-viewer')
const vec3 = require('vec3')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalFollow } = goals
let followTarget = null
const bot = mineflayer.createBot({
    
    host: 'Zhekagoogle228.aternos.me',
    port: 59487,
    username: 'MEGAGALANDON',
    version: '1.12.2'
  })
  
bot.loadPlugin(pathfinder)
bot.on('spawn', () => {
  console.log('Бот зашёл на сервер')
  
})
bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3007, firstPerson: false })
  })
bot.on('chat', async (username, message) => {
  if (username === bot.username) return

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
      equipByName(message.split(' ')[1])
      break
  }
  const args = message.split(' ')

  if (args[0] === 'follow') {
    followTarget = args[1]
    bot.chat(`Иду за ${followTarget}`)
  }

  if (args[0] === 'stop') {
    followTarget = null
    bot.pathfinder.setGoal(null)
    bot.chat('Остановился')
  }
})

bot.on('physicsTick', () => {
    if (!followTarget) return
  
    const player = bot.players[followTarget]?.entity
    if (!player) return
  
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
  
    bot.pathfinder.setMovements(movements)
    bot.pathfinder.setGoal(new GoalFollow(player, 1), true)
  })

function sayItems (items = bot.inventory.items()) {
    const output = items.map(itemToString).join(', ')
    if (output) {
      bot.chat(output)
    } else {
      bot.chat('empty')
    }
  }
  

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
  
  function build () {
    const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    const jumpY = Math.floor(bot.entity.position.y) + 1.0
    bot.setControlState('jump', true)
    bot.on('move', placeIfHighEnough)
  
    let tryCount = 0
  
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