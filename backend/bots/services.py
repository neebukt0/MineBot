# -*- coding: utf-8 -*-
from pathlib import Path
from django.conf import settings
from .models import Bot
from urllib import request, error
import json


def create_bot_file(bot: Bot) -> Path:
    """Создаёт JavaScript-файл бота с подключением к серверу управления."""
    bots_dir = Path(settings.BASE_DIR) / "bots_runtime"
    bots_dir.mkdir(exist_ok=True)
    file_path = bots_dir / f"{bot.id}.js"

    code = f"""const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const vec3 = require('vec3')
const WebSocket = require('ws')
const {{ pathfinder, Movements, goals }} = require('mineflayer-pathfinder')
const {{ GoalFollow }} = goals

const BOT_ID = '{bot.id}'
const CONTROL_SERVER_URL = 'ws://localhost:3008'
let followTarget = null
let ws = null

const bot = mineflayer.createBot({{
  host: '{bot.server_ip}',
  port: {bot.server_port},
  username: '{bot.username}',
  version: '{bot.version}'
}})

bot.loadPlugin(pathfinder)

function connectToControlServer() {{
  ws = new WebSocket(CONTROL_SERVER_URL)

  ws.on('open', () => {{
    console.log('Connected to control server')
    ws.send(JSON.stringify({{ type: 'register', botId: BOT_ID }}))
  }})

  ws.on('message', (message) => {{
    try {{
      const data = JSON.parse(message)
      handleControlMessage(data)
    }} catch (err) {{
      console.error('Invalid control server message:', err)
    }}
  }})

  ws.on('close', () => {{
    console.log('Control server disconnected, reconnecting in 5 seconds...')
    setTimeout(connectToControlServer, 5000)
  }})

  ws.on('error', (err) => {{
    console.error('Control server error:', err)
  }})
}}

function handleControlMessage(data) {{
  if (!data || data.type !== 'command') return
  executeRemoteCommand(String(data.command || ''))
}}

async function executeRemoteCommand(command) {{
  const args = command.trim().split(' ')
  const action = args[0]?.toLowerCase()
  if (!action) return

  switch (action) {{
    case 'help':
      bot.chat('help list dig build follow <name> equip <item> stop')
      break
    case 'list':
      sayItems()
      break
    case 'dig':
      await dig()
      break
    case 'build':
      build()
      break
    case 'follow':
      followTarget = args[1] || null
      if (followTarget) bot.chat(`Following ${{followTarget}}`)
      break
    case 'equip':
      if (args[1]) await equipByName(args[1])
      break
    case 'stop':
      followTarget = null
      bot.pathfinder.setGoal(null)
      bot.chat('Stopped')
      break
    default:
      bot.chat(`Unknown command: ${{command}}`)
  }}
}}

bot.on('spawn', () => {{
  console.log('Bot spawned')
  connectToControlServer()
}})

bot.once('spawn', () => {{
  mineflayerViewer(bot, {{ port: 3007, firstPerson: false }})
}})

bot.on('chat', async (username, message) => {{
  if (username === bot.username) return
  await executeRemoteCommand(message)
}})

bot.on('physicsTick', () => {{
  if (!followTarget) return
  const player = bot.players[followTarget]?.entity
  if (!player) return

  const mcData = require('minecraft-data')(bot.version)
  const movements = new Movements(bot, mcData)
  bot.pathfinder.setMovements(movements)
  bot.pathfinder.setGoal(new GoalFollow(player, 1), true)
}})

function sayItems(items = bot.inventory.items()) {{
  const output = items.map(itemToString).join(', ')
  bot.chat(output || 'empty')
}}

async function equipByName(name) {{
  const item = bot.inventory.items().find(i => i.name.includes(name))
  if (!item) {{
    bot.chat('Item not found')
    return
  }}
  await bot.equip(item, 'hand')
  bot.chat(`Equipped ${{item.name}}`)
}}

async function dig() {{
  const target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  if (!target || !bot.canDigBlock(target)) {{
    bot.chat('cannot dig')
    return
  }}

  try {{
    await bot.dig(target)
    bot.chat(`finished digging ${{target.name}}`)
  }} catch (err) {{
    console.error(err)
    bot.chat('error while digging')
  }}
}}

function build() {{
  const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
  if (!referenceBlock) {{
    bot.chat('no block to build')
    return
  }}

  const jumpY = Math.floor(bot.entity.position.y) + 1.0
  bot.setControlState('jump', true)
  bot.on('move', placeIfHighEnough)

  let tryCount = 0

  async function placeIfHighEnough() {{
    if (bot.entity.position.y > jumpY) {{
      try {{
        await bot.placeBlock(referenceBlock, vec3(0, 1, 0))
        bot.setControlState('jump', false)
        bot.removeListener('move', placeIfHighEnough)
        bot.chat('Placed a block')
      }} catch (err) {{
        tryCount++
        if (tryCount > 10) {{
          bot.chat(err.message)
          bot.setControlState('jump', false)
          bot.removeListener('move', placeIfHighEnough)
        }}
      }}
    }}
  }}
}}

function itemToString(item) {{
  return item ? `${{item.name}} x ${{item.count}}` : '(nothing)'
}}

bot.on('error', (err) => {{
  console.error('Bot error:', err)
}})

bot.on('kicked', (reason) => {{
  console.error('Bot kicked:', reason)
}})
"""

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

    return file_path
