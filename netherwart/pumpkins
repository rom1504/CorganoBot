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
  setTimeout( function() {
    bot.chat("/is home");
    setTimeout( function() {
      pumpkin()
    }, 1000)
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
    case 'empty':
      emptyInv([]);
      break;
    case 'hand':
      console.log(bot.heldItem);
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
  var block, block2, y=0

  //~ block = bot.blockAt(  vec3(6737,99,4150)  )
  //~ return replantNether(block)

  for (z = 0; z < 20; z = z+1) {
    for (x = 0; x < z*4; x = x+1) {
      //~ console.log(x+", "+z)
      for (modx = -1; modx < 2; modx = modx +2) {
        if (x == 0 && modx == 1){break}
        for (modz = -1; modz < 2; modz = modz +2) {
          if (z == 0 && modz == 1){break}

          block  = bot.blockAt(  bot.entity.position.offset( modx*x, y-0, modz*z)  )
          block2 = bot.blockAt(  bot.entity.position.offset( modx*x, y-1, modz*z)  )
          //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

          if (!bot.lastTarget) {bot.lastTarget = block};

          // check for grown netherwart
          if (block && block.type == 115 && (bot.lastTarget.position.x != block.position.x || bot.lastTarget.position.y != block.position.y) && block.metadata == 3) {
            console.log(">Grown netherwart at "+block.position.x+", "+block.position.y+", "+block.position.z)
            return digNether(block)
            //~ return setTimeout(pumpkin, 5000)
          }

          // check for empty soulsand
          if (block && block.type == 0 && block2 && block2.type == 88) {
            console.log(">empty soulsand at "+block.position.x+", "+block.position.y+", "+block.position.z)
            return digNether(block)
            //~ return equiptNether(block)
          }


        } // for mody
      } // for modx
    } // for x
  } // for y



  // code for finding pumpkins, not used right now.

  //~ for (y = 0; y < 1; y = y+1) {
    //~ for (dist = 0; dist < 20; dist = dist+1) {
      //~ for (x = -dist; x < dist+1; x = x+1) {

        //~ block = bot.blockAt(  bot.entity.position.offset( x, y, 0-(dist-Math.abs(x)) )  )
        //~ if (block && (bot.lastTarget.position.x != block.position.x || bot.lastTarget.position.y != block.position.y) && block.type == 86) {
          //~ bot.lastTarget = block
          //~ digMellon(block)
          //~ return 3
        //~ }
        //~ block = bot.blockAt(  bot.entity.position.offset( x, y, (dist-Math.abs(x)) )  )
        //~ if (block && (bot.lastTarget.position.x != block.position.x || bot.lastTarget.position.y != block.position.y) && block.type == 86) {
          //~ bot.lastTarget = block
          //~ digMellon(block)
          //~ return 4
        //~ }

      //~ }
    //~ }
  //~ }
  console.log("!No netherwart or pumpkin found. Waiting")
  bot.chat('/is home')
  console.log( bot.entity.position)
  return setTimeout(pumpkin, 5000);


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
    //~ console.log(">Dig netherwart!")
    var distance = Math.abs(block.position.x-bot.entity.position.x) + Math.abs(block.position.y-bot.entity.position.y) + Math.abs(block.position.z-bot.entity.position.z)
    //~ console.log(distance)
    if (distance > 2.2) {
      console.log("  Walking to block first")
      var location = vec3(
        parseFloat(block.position.x, 10),
        parseFloat(block.position.y, 10),
        parseFloat(block.position.z, 10) );
      var results = bot.navigate.findPathSync(location);
      //~ console.log("   status: " + results.status);
      //~ return fadhadfh

      bot.navigate.walk(results.path, function(stopReason) {
        console.log("    done walking. " + stopReason);
        digNether(block)
      });
    } else {
      console.log("Digging block")
      if(block && bot.canDigBlock(block)) {
        console.log("  starting to dig " + block.name);
        bot.dig(block, function(err){
          setTimeout(function(){
            if(err) {
              //~ bot.chat("/tell MCorgano unable to dig netherwart: " + err.message);
              console.log("!  unable to dig netherwart: " + err.message);
              //~ return pumpkin()
              return
            } else {
              console.log("+  Netherwart already mined!")
              return setTimeout(function(){  equiptNether(block)  }, 300);
            }
          }, 200);
        });

      } else if(block && block.type == 0) {
        console.log("+  Netherwart already mined!")
        return setTimeout(function(){  equiptNether(block)  }, 300);
      } else { // if block && bot.canDigBlock(block) is false
        console.log(block)
        console.log("!  Block error while looking for netherwart!")
        return pumpkin()
      }
    }
  } // sub-function digNether

  function equiptNether(block, trynum) {
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum > 10) {console.print("!    no netherwart in inv!"); return; return pumpkin() }
    console.log("  switching to netherwart")
    if (!bot.heldItem || bot.heldItem.type != 372) {
      bot.equip(372, 'hand', function(err){
        if(err) {

          if(err.message == "Invalid item object in equip") {
            console.log("-    Netherwart not found in inventory. Waiting a bit to pick it up and trying again")
            return setTimeout(function(){  equiptNether(block, trynum + 1)  }, 400)
          } else {
            console.log("!  unable to equip netherwart: " + err.message);
            return
            return pumpkin()
          }
        } else {
          console.log("+  Equipped netherwart sccessfully")
          //~ return
          return setTimeout(function(){replantNether(block);}, 300);
        }
      })
    } else { //
      console.log("+  Netherwart equipped already!")
      //~ return
      return setTimeout(function(){replantNether(block);}, 300);
    }
  }

  function replantNether(block, trynum) {
    var newBlock = bot.blockAt( mineflayer.vec3(block.position.x ,block.position.y ,block.position.z))
    console.log("  Before planting block ID: "+newBlock.type)
    if (newBlock.type == 115) {console.log("    Block is already netherwart? returning..."); return pumpkin() }
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum > 5) {console.log("!    placing netherwart keeps failing!"); return; return pumpkin() }
    console.log(block)
    console.log(">  planting netherwart")
    var location = vec3( parseFloat(block.position.x, 10), parseFloat(block.position.y-1, 10), parseFloat(block.position.z, 10) );
    var reference = bot.blockAt( location )
    console.log("reference")
    console.log(reference)

    bot.placeBlock(reference, mineflayer.vec3(0, 1, 0));
    console.log("   placed block")
    setTimeout(function(){
      var newBlock = bot.blockAt( mineflayer.vec3(block.position.x ,block.position.y ,block.position.z))
      console.log("  New block ID: "+newBlock.type)
      if (newBlock.type != 115) {
        setTimeout(function(){
          var newBlock = bot.blockAt( mineflayer.vec3(block.position.x ,block.position.y ,block.position.z))
          console.log("  New block ID: "+newBlock.type)
          if (newBlock.type != 115) {
            console.log("-    Placeing netherwart failed, trying again...")
            //~ return
            return setTimeout( function(){  replantNether(block, trynum+1)  }, 200);
          } else {
            console.log("+    planting succeeded! (second check)")
            return
            return pumpkin()
          }
        }, 200)

      } else {
        console.log("+    planting succeeded!")
        return
        return pumpkin()
      }
    }, 200)
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
	//~ console.log("Dig called")
  if(bot.targetDigBlock) {
    console.log("  already digging " + bot.targetDigBlock.name);
  } else {
    var target = bot.blockAt(bot.entity.position.offset(0, 1, 2));
    if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, 3))}
    if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, 4))}
    if ( !target || target.type != 4 || !target.harvestTools) {console.log("All blocks dug?"); return setTimeout(dig, 100)}


    if ( !target || !target.harvestTools ) {
      console.log("  Target block invalid?")
      console.log(target)
      //~ dsgafgadfg
      //~ setTimeout(function(){dsgafgadfg}, 2000)
      return setTimeout(dig, 100)
    }

    if ( !bot.heldItem || !target.harvestTools[bot.heldItem.type] || target.harvestTools[bot.heldItem.type] != true){
      return emptyAndEquipt()
    }

    if(target && bot.canDigBlock(target)) {
      //~ console.log("  starting to dig " + target.name);
      return bot.dig(target, onDiggingCompleted);
    } else {
      console.log("    cannot dig");
    }
  }

  function emptyAndEquipt(){
    console.log("  emptyAndEquipt");
    //~ bot.lookAt(bot.entity.position.offset(-1, -0.5, 0), false, function(){
      //~ bot.lookAt(bot.entity.position.offset(-1, -0.5, 0), true, function(){
        emptyInv(Object.keys(target.harvestTools), function(){
          setTimeout( function() {
            equipOneOf(Object.keys(target.harvestTools), 0, function(){
              target = bot.blockAt(bot.entity.position.offset(0, 1, 0));
              //~ console.log("   Djgging block under dropped items")
              //~ bot.dig(target, onDiggingCompleted);
              return dig()

            });
          }, 100)
        });
      //~ });
    //~ });
    return
  }

  function onDiggingCompleted() {
    console.log("    finished digging " + target.name);
    var block = bot.blockAt( mineflayer.vec3(target.position.x ,target.position.y ,target.position.z))
    if (block && block.id == 4) {
      console.log("!    Block was not mined. Re-equipping pickaxe")
      return setTimeout( emptyAndEquipt(), 200)
    } else {
      setTimeout(dig, 100)
    }
  }
}

//Tries to equipt an item from an array
function equipOneOf(list, num, callback) {
  if (num == 0){
    console.log("Equipting item from list:")
    console.log(list)
	//~ console.log(bot.inventory.items())
  }
  //~ console.log(" trying to equipt item "+parseInt(list[num]))
  bot.equip(parseInt(list[num]), 'hand', function(err) {
    if(err) {
      //~ console.log(parseInt(list[num])+"  "+err)
      if (err == "Error: Server rejected transaction."){
        console.log("    Error equipting "+num+", re-try in 0.200 seconds")
        return setTimeout( function(){ equipOneOf(list, num, callback) }, 200)
      } else if (list.length > num+1) {
        equipOneOf(list, num+1, callback)
      } else {
        console.log("    Finnished Equipt list before finding item")
        return -1
      }

    } else {
      console.log("    equipped item "+list[num]);
      callback()
    }
  });
}

function emptyInv(list, callback) {
    console.log("Dumping items from inventory not on this list:")
    console.log(list)

  for (var i=0; i<bot.inventory.items().length; i++) {
    if (list.indexOf( bot.inventory.items()[i].type.toString() ) == -1){
      console.log("List does not contain item "+bot.inventory.items()[i].type)
      return bot.tossStack(bot.inventory.items()[i], function(){
        setTimeout(emptyInv(list, callback), 40)
      })
    }
  }
//~ asdfsagasd
  console.log("Finnished emptyInv")
  if (callback) return callback()
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
    return item.type + " x " + item.count;
  } else {
    return "(nothing)";
  }
}
