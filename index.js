var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var navigatePlugin = require('../')(mineflayer);

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node digger.js <host> <port> [<name>] [<password>]");
  process.exit(1);
}

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "digger",
  password: process.argv[5],
  verbose: true,
});

bot.chatAddPattern(/^\[.*\] ?([^\]:]*) ?: ?(.*)$/, "chat", "epicsb chat");
bot.chatAddPattern(/^\[.*?(\w*) -> me \] (.*)$/, "whisper", "epicsb whisper");
bot.chatAddPattern(/^\[.*\] (.+) has requested (?:to teleport to you|that you teleport to them)\.$/, "tpRequest", "epicsb tpa request");
bot.chatAddPattern(/^(\w*) wants you to join a party. Use \/island join to accept the request$/, "addRequest", "epicsb add to island request");


navigatePlugin(bot);
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[115] = true; // avoid netherwart
//~ bot.navigate.blocksToAvoid[104] = true; // avoid pumpkin stem
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops


inject()
function inject(bot) {
  var lastTarget = {position:{x:0, y:0, z:0}}
}

bot.navigate.on('pathPartFound', function (path) {
  //~ bot.chat("Going " + path.length + " meters in the general direction for now.");
});

bot.navigate.on('pathFound', function (path) {
  //~ bot.chat("I can get there in " + path.length + " moves.");
});

bot.navigate.on('cannotFind', function (closestPath) {
  //~ bot.chat("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath);
});

bot.navigate.on('arrived', function () {
  //~ bot.chat("I have arrived");
});

bot.navigate.on('interrupted', function() {
  //~ bot.chat("stopping");
});



bot.on('spawn', function() {
  //~ setTimeout( function() {
    //~ bot.chat("/home");
    setTimeout( function() {
      pumpkin()
    //~ }, 2000)
  }, 1000)
});

bot.on('tpRequest', function(username) {
  if ( username == "MCorgano" || username == "djrockster" ) {
    bot.chat("/tpyes")
  }
});

bot.on('chat', function(username, message) {
  //~ console.log(username + ":  " + message)
});

bot.on('whisper', function(username, message) {
  if(username === bot.username) {return;}
  var target = bot.players[username].entity;

  switch(message) {
    case 'list':
      sayItems();
      break;
    case 'dig':
      dig();
      break;
    case 'pumpkin':
      pumpkin();
      break;
    case 'tree':
      var position = findTree();
      mineTree(position);
      break;
    case 'equip dirt':
      equipDirt();
      break;
    case 'come':
      bot.navigate.to(target.position);
      break;
    case 'stop':
      bot.navigate.stop();
      break;
    case 'testcb':
      bot.chat("computing path to " + target.position);
      var results = bot.navigate.findPathSync(target.position);
      bot.chat("status: " + results.status);
      bot.navigate.walk(results.path, function(stopReason) {
        bot.chat("done. " + stopReason);
      });
      break;

    default:
      break;

  }

  if (message.substring(0, 3) == "say") {
    bot.chat(message.substring(4));
  } else {
    var match = message.match(/^goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*$/);
    if (match) {
      var pt = vec3(
        parseFloat(match[1], 10),
        parseFloat(match[2], 10),
        parseFloat(match[3], 10));
      bot.navigate.to(pt);
    } else {
      console.log("no match");
    }
  }

});


function findTree(items) {
  console.log("tree fired");
  var s = ""
  var block
  var xRotations = [ [ 0, 1, 1, 0], [ 0, 0,-1,-1], [ 0,-1,-1, 0], [ 0, 0, 1, 1] ]
  var zRotations = [ [ 0, 0, 1, 1], [ 0,-1,-1, 0], [ 0, 0,-1,-1], [ 0,-1,-1, 0] ]
  var r = 0, x2, z2
  var center = [x=0, y=0, z=0]


  for (z = -8; z < 8; z = z+1) {
    s = ""
    for (x = -8; x < 8; x = x+1) {
      block = bot.blockAt(bot.entity.position.offset(x, 0, z))
      //~ ahfdah
      if (block.type == 17) {
        //~ console.log(x+", 0, "+z)
        //~ console.log(bot.entity.position.offset(x, 0, z))
        //~ console.log(block.position)
        //~ console.log(block.type)
        //~ var temp = bot.blockAt(bot.entity.position.offset(x, 0, z))

        for (r = 0; r < 4; r = r+1) {
          for (i = 0; i < 4; i++) {
            //~ console.log(parseInt(x+xRotations[r][i])+", 0, "+parseInt(z+zRotations[r][i]))
            var block = bot.blockAt(bot.entity.position.offset(parseInt(x+xRotations[r][i]), 0, parseInt(z+zRotations[r][i])) )
            //~ console.log(block.type)
            if ( block.type != 17) break;
            if (i == 3) {
              center = bot.entity.position.offset( x+0.5+((xRotations[r][0]+xRotations[r][2])/2), 0, z+0.5+((zRotations[r][0]+zRotations[r][2])/2) )
              console.log("Center =")
              console.log(center)
              return center
            }
          }
        }

      }
      //~ if (block) {
        //~ var s = s + "	" + block.type +":"+ block.metadata
      //~ } else {
        //~ var s = s + "	"
      //~ }
      //~ var s = s + "    "+x+","+y
    }
    //~ console.log(s)
  }


}

function pumpkin() {
  //~ console.log("pumpkin fired");
  var block, block2

  //diamond shaped search pattern. cool eh?
  for (y = 0; y < 1; y = y+1) {
    for (dist = 0; dist < 20; dist = dist+1) {
      for (x = -dist; x < dist+1; x = x+1) {

        for (mod = -1; mod < 2; mod = mod +2) {

          block = bot.blockAt(  bot.entity.position.offset( x, y, mod*(dist-Math.abs(x)) )  )
          block2 = bot.blockAt(  bot.entity.position.offset( x, y-1, mod*(dist-Math.abs(x)) )  )
          if (!bot.lastTarget) {bot.lastTarget = block};


		  if (block && block.type == 115 && (bot.lastTarget.position.x != block.position.x || bot.lastTarget.position.y != block.position.y) && block.metadata == 3) {

            digNether(block)

            return 1
          }
          if (block && block.type == 0 && block2 && block2.type == 88) {
              console.log(">Planting netherwart on empty soulsand at "+block2.position.x+", "+block2.position.z)

              bot.lastTarget = block;
              bot.equip(372, 'hand', function(err){
                if(err) {
                  console.log("!  unable to equip netherwart: " + err.message);
                  return pumpkin();
                } else {
                  console.log("  Equipped netherwart sccessfully")

                  bot.lookAt(block2.position, false, function(){
                    //~ bot.lookAt(block2.position, true, function(){
                      setTimeout(function(){
                        //~ bot.placeBlock(block2, mineflayer.vec3(0, 1, 0));
                        bot.placeBlock(block, mineflayer.vec3(0, -1, 0));
                        //~ bot.placeBlock(block, mineflayer.vec3(0, 1, 0));
                        //~ bot.placeBlock(block, mineflayer.vec3(0, -1, 0));
                        console.log("Done, returning")
                        return pumpkin()

                      }, 300);
                      return 8
                    });
                  });
                }
              });

              return 11
          }
        }

      }
    }
  }

  for (y = 0; y < 1; y = y+1) {
    for (dist = 0; dist < 20; dist = dist+1) {
      for (x = -dist; x < dist+1; x = x+1) {

        block = bot.blockAt(  bot.entity.position.offset( x, y, 0-(dist-Math.abs(x)) )  )
        if (block && (bot.lastTarget.position.x != block.position.x || bot.lastTarget.position.y != block.position.y) && block.type == 86) {
          bot.lastTarget = block
          digMellon(block)
          return 3
        }
        block = bot.blockAt(  bot.entity.position.offset( x, y, (dist-Math.abs(x)) )  )
        if (block && (bot.lastTarget.position.x != block.position.x || bot.lastTarget.position.y != block.position.y) && block.type == 86) {
          bot.lastTarget = block
          digMellon(block)
          return 4
        }

      }
    }
  }
  console.log("!No pumpkind found. Waiting")
  bot.chat('/is home')
  setTimeout(pumpkin, 2000);
  return 5


  function onDiggingCompleted() {
    console.log("    finished digging " + block.name);
    setTimeout(function(){console.log("    restarting"); console.log(pumpkin())}, 300)
  }

  function digMellon(block) {
    var location = vec3(
        parseFloat(block.position.x, 10),
        parseFloat(block.position.y, 10),
        parseFloat(block.position.z, 10) );
    var results = bot.navigate.findPathSync(location);
    console.log("status: " + results.status);
    bot.navigate.walk(results.path, function(stopReason) {
      //~ console.log("done walking. " + stopReason);
      if (stopReason != "arrived") {
        console.log("Error going to pumpkin: '"+stopReason+"'")
        pumpkin()
        return 6
      } else if(block && bot.canDigBlock(block)) {
        console.log("  starting to dig " + block.name);
        bot.dig(block, onDiggingCompleted);
      } else {
        console.log("    cannot dig");
      }

    });

  }

  function digNether(block) {
    console.log(">Dig netherwart!")
    var location = vec3(
        parseFloat(block.position.x, 10),
        parseFloat(block.position.y, 10),
        parseFloat(block.position.z, 10) );
    var results = bot.navigate.findPathSync(location);
    //~ console.log("status: " + results.status);
    bot.navigate.walk(results.path, function(stopReason) {
      //~ console.log("done walking. " + stopReason);
      if(block && bot.canDigBlock(block)) {
        console.log("  starting to dig " + block.name);
        bot.dig(block, function(err){setTimeout(function(){
          if(err) {
            //~ bot.chat("/tell MCorgano unable to dig netherwart: " + err.message);
            console.log("!  unable to dig netherwart: " + err.message);
            pumpkin()
            return 9
          } else {
            //~ console.log(block)
            //~ dsGAFDHD
            //~ if (block.type == 115) {
              //~ console.log("  try digging again")
              //~ digNether(block)
              //~ return
            //~ } else {
              console.log("+  digging netherwart worked!")
              setTimeout(function(){equiptNether(block);}, 300);
            //~ }
          }
          return 7
        }, 1000); });
      } else {
        console.log(block)
        console.log("!  Block error while looking for netherwart!")
        pumpkin()
        return 10
      }
    });
  }

  function replantNether(block) {
    //~ console.log(block)
    console.log(">  planting netherwart")
    var location = vec3(
    parseFloat(block.position.x, 10),
    parseFloat(block.position.y-1, 10),
    parseFloat(block.position.z, 10) );
    var reference = bot.blockAt( location )
    //~ console.log(block)
    //~ console.log(reference)
    setTimeout(function(){
      bot.placeBlock(reference, mineflayer.vec3(0, 1, 0));
      console.log("   placed block")
      //~ fgadfhadh
      setTimeout(function(){
        console.log("Done, returning")
        bot.placeBlock(reference, mineflayer.vec3(0, 1, 0));
        pumpkin()
      }, 100)
    }, 100)
    return
  }

  function equiptNether(block) {
    console.log("  switching to netherwart")
    bot.equip(372, 'hand', function(err){
      if(err) {
        //~ bot.chat("/tell MCorgano unable to equip netherwart: " + err.message);
        console.log("!  unable to equip netherwart: " + err.message);
        pumpkin()
      } else {
        console.log("  Equipped netherwart sccessfully")
        setTimeout(function(){replantNether(block);}, 300);
        return 8
      }
    })
  }



}

function mineTree(center) {
  var position = {x:0,y:0,z:0}
  var i = 0
  var xRotations = [ 0-0.5, 0.5, 0.5, 0-0.5]
  var zRotations = [ 0-0.5, 0-0.5, 0.5, 0.5]
  console.log(center)
  recurse()

  //~ for (i = 0; i < 4; i++) {
    //~ console.log(i+"      "+xRotations[i]+"      "+zRotations[i])
    //~ position.x = center.x + xRotations[i]
    //~ position.z = center.z + zRotations[i]
    //~ console.log(position)
  //~ }
  //~ dbagb

  function recurse() {
    console.log("recurse called "+i)
    if (i == 4) { return }
    position.x = center.x + xRotations[i]
    position.z = center.z + zRotations[i]
    console.log("Moving to "+position.x+", "+position.y+", "+position.z)

    var pt = vec3(
        parseFloat(center.x + xRotations[i], 10),
        parseFloat(center.y, 10),
        parseFloat(center.z + zRotations[i], 10));
    var results = bot.navigate.findPathSync(pt);
    console.log("status: " + results.status);
    bot.navigate.walk(results.path, function(stopReason) {
      console.log("done walking. " + stopReason);

      if(bot.targetDigBlock) {
        console.log("  already digging " + bot.targetDigBlock.name);
      } else {
        var target = bot.blockAt(pt);

        //~ console.log(target.harvestTools[bot.heldItem.type]) // Is the held item an item it can use to dig?
        console.log("digging log at")
        console.log(target.position)
        //~ console.log(target)
        //~ console.log(Object.keys(target.harvestTools) )
        //~ afhgadfhaehg

        if ( !target) {
          console.log("  Target block invalid?")
          return
        }

        console.log(bot.heldItem.type)

        if ( !bot.heldItem || bot.heldItem.type != 275){
          console.log("equipting zxe")
          bot.equip(parseInt(275), 'hand', function(err) {
            if(err) {
              console.log("    Finnished Equipt list before finding item")
              return -1
            } else {
              console.log("    equipped item "+275);
              recurse()
            }
          });
        }

        if(target && bot.canDigBlock(target)) {
          console.log("  starting to dig " + target.name);
          bot.dig(target, onDiggingCompleted);
        } else {
          console.log("non valid target or cannot dig");
        }
        return

      }


      function onDiggingCompleted() {
        console.log("    finished digging " + target.name);
        i=i+1
        console.log("wait 5 seconds")
        setTimeout(recurse, 5000)
      }


    });
  }
}

function sayItems(items) {
  items = items || bot.inventory.items();
  var output = items.map(itemToString).join(', ');
  if(output) {
    bot.chat("/tell MCorgano "+output);
    console.log(output)
  } else {
    bot.chat("/tell MCorgano empty");
  }
}

function dig() {
  console.log("Dig called")
  if(bot.targetDigBlock) {
    console.log("  already digging " + bot.targetDigBlock.name);
  } else {
    var target = bot.blockAt(bot.entity.position.offset(-1, -2, 0));
    if ( !target || target.type !== 4) {target = bot.blockAt(bot.entity.position.offset(0, -2, -1))}
    if ( !target || target.type !== 4) {target = bot.blockAt(bot.entity.position.offset(+1, -2, 0))}
    if ( !target || target.type !== 4) {target = bot.blockAt(bot.entity.position.offset(0, -2, +1))}

  //~ console.log(target.harvestTools[bot.heldItem.type]) // Is the held item an item it can use to dig?
  //~ console.log(target.harvestTools)
  //~ console.log(Object.keys(target.harvestTools) )
  //~ afhgadfhaehg

  if ( !target || !target.harvestTools ) {
    console.log("  Target block invalid?")
    setTimeout(dig, 300)
    return
  }

  if ( !bot.heldItem || !target.harvestTools[bot.heldItem.type] || target.harvestTools[bot.heldItem.type] != true){
    console.log("  Need to equipt pick")
    equipOneOf(Object.keys(target.harvestTools), 0, dig)
    return
  }

  if(target && bot.canDigBlock(target)) {
      console.log("  starting to dig " + target.name);
      bot.dig(target, onDiggingCompleted);
    } else {
      console.log("    cannot dig");
    }
  }

  function onDiggingCompleted() {
    console.log("    finished digging " + target.name);
    dig()
  }
}

//Tries to equipt an item from an array
function equipOneOf(list, item, callback) {
  if (item == 0){
    console.log("Equipting item from list:")
    console.log(list)
  }
  console.log(" trying to equipt item "+list[item])

  bot.equip(parseInt(list[item]), 'hand', function(err) {
    if(err) {
      if (list.length > item+1) {
        equipOneOf(list, item+1, callback)
      } else {
        console.log("    Finnished Equipt list before finding item")
        return -1
      }

    } else {
      console.log("    equipped item "+list[item]);
      callback()
    }
  });
}

function build() {
  var referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1.0;
  bot.setControlState('jump', true);
  bot.on('move', placeIfHighEnough);

  function placeIfHighEnough() {
    if(bot.entity.position.y > jumpY) {
      bot.placeBlock(referenceBlock, mineflayer.vec3(0, 1, 0));
      bot.setControlState('jump', false);
      bot.removeListener('move', placeIfHighEnough);
    }
  }
}

function equipDirt() {
  bot.equip(0x03, 'hand', function(err) {
    if(err) {
      bot.chat("/tell MCorgano unable to equip dirt: " + err.message);
    } else {
      bot.chat("/tell MCorgano equipped dirt");
    }
  });
}

function itemToString(item) {
  if(item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}