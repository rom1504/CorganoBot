var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var navigatePlugin = require('mineflayer-navigate')(mineflayer);

if(process.argv.length < 4) {
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

masters = ["djrockster", "MCorgano", "TheBuzzSaw", "MCorBit"]

navigatePlugin(bot);
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[70] = false; // avoid redstone
bot.navigate.blocksToAvoid[72] = false; // avoid redstone
bot.navigate.blocksToAvoid[55] = false; // avoid redstone
bot.navigate.blocksToAvoid[331] = false; // avoid redstone
bot.navigate.blocksToAvoid[115] = true; // avoid netherwart
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops

bot.navigate.on('pathPartFound', function (path) {
  console.log("Going " + path.length + " meters in the general direction for now.");
});
bot.navigate.on('pathFound', function (path) {
  console.log("I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotFind', function (closestPath) {
  console.log("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath);
});
bot.navigate.on('arrived', function () {
  console.log("I have arrived");
});
bot.navigate.on('interrupted', function() {
  console.log("stopping");
});




bot.on('spawn', function() {
  console.log("Bot has spawnned!")
  setTimeout( function() {

    console.log("Username == "+bot.username)

    //~ bot.chat("/home");
    //~ bot.equip(0, 'hand')
    bot.unequip()
    setTimeout( function() {
      if (process.argv.length > 5){
        if (process.argv[6] == "cobble"){
          bot.chat("/home");
          setTimeout(function() {
            emptyInv(Object([ '257', '270', '274', '278', '285' ]), function(){
              equipOneOf(Object([ '257', '270', '274', '278', '285' ]), 0, function(){
                target = bot.blockAt(bot.entity.position.offset(0, 1, 0));
                return dig()
              });
            });
          }, 1000)
        } else if (process.argv[6] == "tree"){
          emptyInv(Object([ '275', '6' ]), function(){
            equipOneOf(Object([ '275' ]), 0, function(){
              bot.chat("/is home")
              setTimeout(tree(), 1000)
            })
          });
        } else if (process.argv[6] == "nether")
          emptyInv(Object(), function(){
            bot.chat("/is home")
            setTimeout(crops(), 1000)
          });
        }
    }, 3000)
  }, 1000)
});
bot.on('tpRequest', function(username) {
  if ( masters.indexOf(username) > -1 ) {
    bot.chat("/tpyes")
  }
});
bot.on('addRequest', function(username) {
  if ( masters.indexOf(username) > -1 ) {
    bot.chat("/island join")
    setTimeout( function(){
	bot.chat("/tpa "+username);
      setTimeout( function(){
        bot.chat("/sethome");
        dig()
      }, 8000);
    }, 1000);
  }
});
bot.on('chat', function(username, message) {
	//~ console.log(username + ":  " + message)
});

bot.on('whisper', function(username, message) {
  if(username === bot.username) {return;}
  var target = bot.entity;
  if (bot.players[username]){target = bot.players[username].entity;}
  //~ console.log("Whisper: "+message)
  switch(message) {
    case 'sweep':
      sweep(function(){  console.log("sweep finnished"); })
      break;
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
    case 'crops':
      crops();
      break;

    case 'tree':
      tree()
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

    default:
      break;

  }

  if (message.substring(0, 3) == "say" && message.substring(4, 8) != "/pay") {
    bot.chat(message.substring(4));
  } else {
    var match = message.match(/^goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*$/);
    if (match) {
      var pt = vec3(
        parseFloat(match[1], 10),
        parseFloat(match[2], 10),
        parseFloat(match[3], 10));
      bot.navigate.to(pt);
    //~ } else {
      //~ console.log("no match");
    }
  }

});

// fadnhadgnjfgSDTNWEMERTMRTJTSNRJE

function moveMiddle(goalPosition,done){
	bot.lookAt(goalPosition.offset(0,bot.entity.height,0),true);
	bot.setControlState('forward', true);
	var arrive=setInterval((function(goalPosition,done){return function()
	{
		if(Math.abs(goalPosition.x-bot.entity.position.x)+Math.abs(goalPosition.z-bot.entity.position.z)<0.12 )
		{
			bot.setControlState('forward', false);
			clearInterval(arrive);
			done();// maybe signal an error if the goal position isn't free (same thing for move to)
		} else bot.lookAt(goalPosition.offset(0,bot.entity.height,0),true);
	}})(goalPosition,done),50);
}

// Swep - looks for any items the bot sees on the same level for it an picks them up
function sweep(callback, lastItem){
  for (var key in bot.entities) {
    // If twice in a row the bot tries to pick up the same item, some error happened. Full inv is most common
    if (bot.entities[key] == lastItem){
      console.log("Failed to pick up item! am I full?")
      return callback("Inventory full (collected same item twice)")

    } else if ( bot.entities[key].metadata && bot.entities[key].metadata['10'] && bot.entities[key].height == 0 && Math.abs(bot.entities[key].position.y - bot.entity.position.y) < 0.1 ){
      console.log("Found one!")
      console.log(bot.entities[key].position, bot.entities[key].metadata['10']);
      var results = bot.navigate.findPathSync(bot.entities[key].position);
      return bot.navigate.walk(results.path, function(stopReason) {
        if (stopReason == "obstructed"){
          console.log("!   Cannot get to location!");
          //~ bot.chat("/is home");
        }

        return setTimeout(function(){ sweep(callback, bot.entities[key]) },300)
      })
    }
  }

  callback()
}

function tree() {


  return sweep(function(){
    var results = bot.navigate.findPathSync( vec3(2187, 142, 3735) );
    return bot.navigate.walk(results.path, function(stopReason) {

      bot.lookAt(bot.entity.position.offset(-1, 1.5, 0), true, function(){
        emptyInv(['275','6'], function(){
          setTimeout( function() {

            equipOneOf('275', 0, function(){
              console.log("Looking for tree")
              var block = searchTree();
              if (!block){
                console.log("no trees found")

                return setTimeout( function(){tree()}, 1000)
              }

              return start(block)

            });

          }, 200)
        });
      });

    });
  });

  function start(block){
    if (!block){console.log("! mineTree called with invalid block!"); return;}
    //~ console.log(">Dig netherwart!")
    //~ var distance = Math.abs(block.position.x-bot.entity.position.x) + Math.abs(block.position.y-bot.entity.position.y) + Math.abs(block.position.z-bot.entity.position.z)
    //~ console.log(distance)
    //~ if (distance > 2.2) {

    console.log("  Walking to tree")
    //~ var location = block.position
    var results = bot.navigate.findPathSync(block.position);

    bot.navigate.walk(results.path, function(stopReason) {
      if (stopReason == "obstructed"){
        console.log("!   Cannot get to location!");
        //~ bot.chat("/is home");
        return
        //~ return setTimeout(function(){ crops() },300)
      }
      return setTimeout(function(){
        console.log("    done walking. " + stopReason);

        // 275 stone axe

        var target1 = block
        var target2 = bot.blockAt(block.position.offset(0, 1, 0))
        var target3 = bot.blockAt(block.position.offset(0, 2, 0))

        console.log("  Equipping axe")
        equipOneOf([275], 0, function(err){
          if (err){
            console.log("Error equipping pic!")
            return
          }
          console.log("    Mining tree")
          bot.dig(target1, function(){
            console.log("      Done mining 1")
            bot.dig(target2, function(){
              console.log("      Done mining 2")
              bot.dig(target3, function(){
                console.log("      Done mining 3")

                var results = bot.navigate.findPathSync(block.position);
                console.log("        Moving to spiral position")
                bot.navigate.walk(results.path, function(stopReason) {
                  if (stopReason == "obstructed"){
                    console.log("!   Cannot get to location! PErhaps mining tree failed?");
                    //~ bot.chat("/is home");
                    return
                    //~ return setTimeout(function(){ crops() },300)
                  }

                  return setTimeout(function(){ spiral(block, 0) }, 200)

                })

              }) // dig 3
            }) // dig 2
          }) // dig 1
        }) // equipt
      }, 100)

        //~ digNether(block)
    });
  }

  function spiral(block, num){
    console.log("  spiral "+num)
    var nextnum = 0, step
    var x = 0
    var z = 0
    if (num == 0){nextnum = 1, x = 1, z = 0}
    if (num == 1){nextnum = 2, x = 0, z = 1}
    if (num == 2){nextnum = 3, x = -1, z = 0}
    if (num == 3){nextnum = 0, x = 0, z = -1}

    step = bot.blockAt(block.position.offset(x, 0, z))
    if (step.type == 0){
      console.log("need to place step!")
      var face = mineflayer.vec3(-1, 0, 0)
      target1 = bot.blockAt(block.position.offset(1, 0, 0))
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(0, 0, 1)); face = mineflayer.vec3(0, 0, -1) }
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(-1, 0, 0)); face = mineflayer.vec3(1, 0, 0) }
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(0, 0, -1)); face = mineflayer.vec3(0, 0, 1) }
      if (!target1 || target1.type == 0){ target1 = bot.blockAt(step.position.offset(0, 1, 0)); face = mineflayer.vec3(0, -1, 0) }

      return equipOneOf(['17','162','163'], 0, function(){
        bot.placeBlock(target1, face, function(){

          spiral(block, num);

        })
      })

    }


    var target1 = bot.blockAt(block.position.offset(x, 1, z))
    var target2 = bot.blockAt(target1.position.offset(0, 1, 0))
    var target3 = bot.blockAt(target1.position.offset(0, 2, 0))
    var check1 = bot.blockAt(target1.position.offset(0, 3, 0))
    var check2 = bot.blockAt(bot.entity.position.offset(0, 3, 0))
    //~ console.log("Next bottom block to mine")
    //~ console.log(target1.position)

    if ((!target1 || target1.type == 0)&&(!target2 || target2.type == 0)&&(!check1 || check1.type == 0)&&(!check2 || check2.type == 0)){

      if (num == 0){x = 1, z = 1}
      if (num == 1){x = 0, z = 1}
      if (num == 2){x = 0, z = 0}
      if (num == 3){x = 1, z = 0}
      location = bot.blockAt(block.position.offset(x, 10, z)).position

      var results = bot.navigate.findPathSync(target1.position);
      console.log("        Moving to top middle")
      bot.navigate.walk(results.path, function(stopReason) {
        console.log(target1.position.y)
        console.log(bot.entity.position.y)
        if (stopReason == "obstructed"){
          console.log("Moving failed, trying again")
          return spiral(block, num);
        }

        var target = ""
        for (x = -1; x < 2; x++){
          for (y =  0; y < 2; y++){
            for (z = -1; z < 2; z++){
              target = bot.blockAt( bot.entity.position.offset(x, y, z) )
              if ( target && (target.type == 17 || target.type == 18 || target.type == 161 || target.type == 162) ) {
                console.log("    Block might be in the way of middle func, digging")
                return bot.dig(target, function(){ spiral(block, num) })
              }
            }
          }
        }


        setTimeout(function(){
          location = vec3(location.x, bot.entity.position.y, location.z)
          moveMiddle(location, function(){
            console.log("At middle!")
            console.log(bot.entity.position)
            //~ return
            return setTimeout(function(){digDown(location)}, 1000)
          }); // movemiddle
        }, 200)
      })


      //~ })
      return
    }

    console.log("  Equipping axe")
    equipOneOf([275], 0, function(){
      console.log("    Mining tree")
      bot.dig(target1, function(){
        //~ console.log("      Done mining 1")
        bot.dig(target2, function(){
          //~ console.log("      Done mining 2")
          bot.dig(target3, function(){
            //~ console.log("      Done mining 3")

            var results = bot.navigate.findPathSync(target1.position);
            console.log("        Moving up to next step")
            bot.navigate.walk(results.path, function(stopReason) {
              if (stopReason == "obstructed"){
                console.log("Moving failed, trying again")
                return spiral(block, num);
              }

              return setTimeout(function(){ spiral(target1, nextnum) }, 200)

            })

          })
        })
      })
    })


  }

  function digDown(location, tryNum){
    if (!tryNum){tryNum=0}
    console.log("Dig down "+tryNum)
    //~ console.log(location)
    //~ console.log(vec3( location.x, bot.entity.position.y -1, location.z))
    var target = ""

    for (x = -3; x < 3; x++){
      for (z = -3; z < 3; z++){
        if ( !target || (target.type != 17 && target.type != 162) ) {target = bot.blockAt( vec3( location.x+x, bot.entity.position.y+1, location.z+z) ); }
      }
    }

    if ( !target || (target.type != 17 && target.type != 162) ) {target = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z) ); }
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {target = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z-1) ); console.log(target.type+"   "+target.position)}
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {target = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z-1) ); console.log(target.type+"   "+target.position)}
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {target = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z) ); console.log(target.type+"   "+target.position)}
    if ( !target || (target.type != 17 && target.type != 18 && target.type != 161 && target.type != 162) ) {
      if (tryNum > 5){
        console.log("No more logs to dig"); return replant(location)
      } else {
        console.log("No logs found, waiting")
        tryNum = tryNum + 1
        return setTimeout(function(){digDown(location, tryNum)}, 100*tryNum)
      }
    }

    if (!target) {
      console.log("  Target block invalid?")
      console.log(target)
      return setTimeout(function(){digDown(location)}, 100)
    }

    if ( !bot.heldItem || bot.heldItem.type != 275){
      console.log("  Equipping axe")
      equipOneOf([275], 0, function(){digDown(location)})
    }

    if(target && bot.canDigBlock(target)) {
      //~ console.log("  starting to dig " + target.name);
      return bot.dig(target, function(){  digDown(location)  });
    } else {
      console.log("    cannot dig");
    }
  }

  //~ function onDiggingCompleted() {
    //~ console.log("    finished digging " + target.name);
    //~ console.log("    finished digging");
    //~ return digDown(location)
  //~ }

  function replant(location){

    //~ console.log(bot.entities)
    //~ console.log("Collect sapplings before replanting")
    //~ return sweep(function(){

    return sweep(function(){
      setTimeout( function() {

        var results = bot.navigate.findPathSync( vec3( location.x, bot.entity.position.y -1, location.z) );
        return bot.navigate.walk(results.path, function(stopReason) {

          var target1 = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z) );
          var target2 = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z) );
          var target3 = bot.blockAt( vec3( location.x-1, bot.entity.position.y -1, location.z-1) );
          var target4 = bot.blockAt( vec3( location.x, bot.entity.position.y -1, location.z-1) );
          //~ bot.equip(bot.inventory.findInventoryItem( 6, 1), "hand", function(err) {
          //~ bot.equip(bot.inventory.findInventoryItem( 6, 5), "hand", function(err) {
          bot.equip(6, "hand", function(err) {
          bot.equip(6, "hand", function(err) {

            bot.placeBlock(target1, mineflayer.vec3(0, 1, 0), function(){
            bot.placeBlock(target2, mineflayer.vec3(0, 1, 0), function(){
            bot.placeBlock(target3, mineflayer.vec3(0, 1, 0), function(){
            bot.placeBlock(target4, mineflayer.vec3(0, 1, 0), function(){
              console.log("done placing sapplings");

              return sweep(function(){
                var results = bot.navigate.findPathSync( vec3(2187, 142, 3735) );
                return bot.navigate.walk(results.path, function(stopReason) {

                  bot.lookAt(bot.entity.position.offset(-1, 1.5, 0), true, function(){
                    emptyInv(['275','6'], function(){
                      setTimeout( function() {
                        equipOneOf('275', 0, function(){
                          return setTimeout( tree(), 1000)
                        });
                      }, 200)
                    });
                  });

                });
              });

            });
            });
            });
            });

          });
          });

        });

      }, 200)
    });

  }
}




//Tries to equipt an item from an array
function equipOneOf(list, num, callback, attempt) {
  if (!attempt){attempt=0}
  if (num == 0){
    console.log("Equipting item from list:")
    console.log(list)
	//~ console.log(bot.inventory.items())
  } else if (attempt && attempt > 5) {
    num ++
    attempt = 0
  }

  //~ console.log(bot.heldItem)
  if (bot.heldItem && list.indexOf(bot.heldItem.type) > -1){console.log("Already holding "+bot.heldItem.type); return callback() }

  //~ console.log(" trying to equipt item "+parseInt(list[num]))
  bot.equip(parseInt(list[num]), 'hand', function(err) {
    if(err) {
      //~ console.log(parseInt(list[num])+"  "+err)
      if (err == "Error: Server rejected transaction."){
        console.log("    Error equipting "+num+", re-try in 0.200 seconds")
        return setTimeout( function(){ equipOneOf(list, num, callback, attempt+1) }, 200)
      } else if (list.length > num+1) {
        equipOneOf(list, num+1, callback)
      } else {
        console.log("    Finnished Equipt list before finding item")
        return setTimeout(callback, 10000)
      }

    } else {
      console.log("    equipped item "+list[num]);
      callback()
    }
  });
}



function crops() {
  //~ console.log("pumpkin fired");
  //~ console.log("pumpkin fired");
  var block, block2, y=0

  // search for grown netherwart
  block = searchLane([115], null, null, [3], null, null, 0)
  if (block){
    return digNether(block)
  }
  // search for empty soulsand
  block = searchLane([0], null, [88], null, null, null, 0)
  if (block){
    return
  }

  console.log("-No crops were found.")
  //~ console.log( bot.entity.position)
  //~ console.log(home)
  //~ console.log(bot.entity.position.x != home.x)
  //~ console.log(bot.entity.position.y != home.y)
  //~ console.log(bot.entity.position.z != home.z)
  //~ if ( bot.entity.position.x != home.x || bot.entity.position.y != home.y || bot.entity.position.z != home.z ){
    //~ console.log(">teleporting home");
    //~ bot.chat('/is home')
    //~ setTimeout(function(){
      //~ return bot.lookAt(bot.entity.position.offset(-2, 2, 0), true, function(){
        //~ emptyInv(["-372"], function(){
          //~ setTimeout(function(){
            //~ return
            //~ pumpkin()
            //~ return
          //~ }, 5000);
          //~ return
        //~ })
      //~ })
    //~ }, 1000)
  //~ } else { // fires when already at /is home, as defined by where /is home was the first time it was called after spawnning.
    //~ setTimeout(function(){
      //~ pumpkin()
    //~ }, 5000);
  //~ }
  return

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
    if (!block){console.log("! digNether called with invalid block!"); return; return crops()}
    //~ console.log(">Dig netherwart!")
    var distance = Math.abs(block.position.x-bot.entity.position.x) + Math.abs(block.position.y-bot.entity.position.y) + Math.abs(block.position.z-bot.entity.position.z)
    //~ console.log(distance)
    //~ if (distance > 2.2) {
    if (distance > 1.2) {
      console.log("  Walking to block first")
      var location = vec3(
        parseFloat(block.position.x, 10),
        parseFloat(block.position.y, 10),
        parseFloat(block.position.z, 10) );
      var results = bot.navigate.findPathSync(location);
      //~ console.log("   status: " + results.status);
      //~ return fadhadfh

      bot.navigate.walk(results.path, function(stopReason) {
        if (stopReason == "obstructed"){
          console.log("!   Cannot get to location!");
          bot.chat("/is home");
          return
          return setTimeout(function(){ crops() },300)
        }
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
              //~ return crops()
              return
            } else {
              console.log("+  Netherwart dug successfully!")
              return setTimeout(function(){  equiptNether(block)  }, 100);
            }
          }, 200);
        });

      } else if(block && block.type == 0) {
        console.log("+  Netherwart already mined!")
        return setTimeout(function(){  equiptNether(block)  }, 300);
      } else { // if block && bot.canDigBlock(block) is false
        console.log(block)
        console.log("!  Block error while trying to mine netherwart!")
        return
        return crops()
      }
    }
  } // sub-function digNether

  function equiptNether(block, trynum) {
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum > 10) {console.log("!    no netherwart in inv!"); return; return crops() }
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
            return crops()
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
    if (newBlock.type == 115) {console.log("    Block is already netherwart? returning..."); return crops() }
    if (!trynum) {trynum = 0} // used for limiting how long it waits to pick up netherwart
    if (trynum > 10) {console.log("!    placing netherwart keeps failing!"); return crops() }
    //~ console.log(block)
    console.log(">  planting netherwart")
    var location = block.position.offset(0,-1,0);
    var reference = bot.blockAt( location )
    //~ console.log("reference")
    //~ console.log(reference)
    bot.lookAt( block.position, false, function(){
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
              return setTimeout( function(){  replantNether(block, trynum+1)  }, trynum*100);
            } else {
              console.log("+    planting succeeded! (second check)")
              //~ return
              return crops()
            }
          }, 300)

        } else {
          console.log("+    planting succeeded!")
          //~ return
          return crops()
        }
      }, 200)
    }); // bot.lookat
  }



  function onDiggingCompleted() {
    console.log("    finished digging " + block.name);
    setTimeout(function(){return; console.log("    restarting"); console.log(crops())}, 300)
  }
}


// Search pattern that looks around in a diamond shape
// type, typeAbove, and typeBelow are arrays containing ints of the block.type to find
// meta, metaAbove, and metaBelow are arrays containing ints of the block.metadata to find
// orientation can be [0 or null] or [1 or greater] to switch the direction of the lanes
//    0: rows going -x to +x
//    1: rows going -z to +z
// If the bot jumps between rows instead of going stright down one row, try changing the orientation :P
// The function searches blocks at the bots location, being where the bot's legs are as the center.
// returns the block found on the same height as the bot's legs, regaurdless of wether typeabove or typebelow are given.
function searchTree() {
  var type = [17, 162]

  var y = 0

  for (dist = 0; dist < 20; dist = dist+1) {      // controls how many blocks out the diamond shape is
    for (x = -dist; x < dist+1; x = x+1) {        // go across the diamond shape, one corner to the other
      for (modz = -1; modz < 2; modz = modz +2) { // switch from top to bottom side of diamond shape
        //~ if (x == 0 && modz == 1){break}

        block1  = bot.blockAt(  bot.entity.position.offset( 0+x, y, 0+modz*(dist-Math.abs(x)) )  )
        block2  = bot.blockAt(  bot.entity.position.offset( 1+x, y, 0+modz*(dist-Math.abs(x)) )  )
        block3  = bot.blockAt(  bot.entity.position.offset( 1+x, y, 1+modz*(dist-Math.abs(x)) )  )
        block4  = bot.blockAt(  bot.entity.position.offset( 0+x, y, 1+modz*(dist-Math.abs(x)) )  )
        //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

        if (block1 && block2 && block3 && block4 && type.indexOf(block1.type) > -1 && type.indexOf(block2.type) > -1 && type.indexOf(block3.type) > -1 && type.indexOf(block4.type) > -1){
          console.log("+    Found!   Block1: "+block1.type+":"+block1.metadata+"   Block3: "+block3.type+":"+block3.metadata)
          return block1
        }

      } // for modZ
    } // for x
  } // dist
  return null
} // searchTree


// Search pattern that looks around in a diamond shape
// type, typeAbove, and typeBelow are arrays containing ints of the block.type to find
// meta, metaAbove, and metaBelow are arrays containing ints of the block.metadata to find
// orientation can be [0 or null] or [1 or greater] to switch the direction of the lanes
//    0: rows going -x to +x
//    1: rows going -z to +z
// If the bot jumps between rows instead of going stright down one row, try changing the orientation :P
// The function searches blocks at the bots location, being where the bot's legs are as the center.
// returns the block found on the same height as the bot's legs, regaurdless of wether typeabove or typebelow are given.
function searchDiamond(type, typeAbove, typeBelow, meta, metaAbove, metaBelow) {
  if (!type){type = 0}

  var y = 0

  for (dist = 0; dist < 20; dist = dist+1) {      // controls how many blocks out the diamond shape is
    for (x = -dist; x < dist+1; x = x+1) {        // go across the diamond shape, one corner to the other
      for (modz = -1; modz < 2; modz = modz +2) { // switch from top to bottom side of diamond shape
        if (x == 0 && modz == 1){break}

        block  = bot.blockAt(  bot.entity.position.offset( x, y, modz*(dist-Math.abs(x)) )  )
        blockBelow = bot.blockAt(  bot.entity.position.offset( x, y-1, modz*(dist-Math.abs(x)) )  )
        blockAbove = bot.blockAt(  bot.entity.position.offset( x, y+1, modz*(dist-Math.abs(x)) )  )
        //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

        if (block && type.indexOf(block.type) > -1 && (!typeAbove || (blockAbove && typeAbove && typeAbove.indexOf(blockAbove.type) > -1)) && (!typeBelow || (blockBelow && typeBelow && typeBelow.indexOf(blockBelow.type) > -1))  ) {
          if (!meta || (meta.indexOf(block.metadata) > -1 && (!metaAbove || (blockAbove && metaAbove && metaAbove.indexOf(blockAbove.metadata) > -1)) && (!metaBelow || (blockBelow && metaBelow && metaBelow.indexOf(blockBelow.metadata) > -1)) )  ) {
            console.log("+    Found!   Block: "+block.type+":"+block.metadata+"   Below: "+blockBelow.type+":"+blockBelow.metadata+"   Top: "+blockAbove.type+":"+blockAbove.metadata)
            return block
          }
        }

      } // for modZ
    } // for x
  } // dist
  return null
} // searchDiamond


// Search pattern that looks up and down in "lanes", useful for farms with crops in rows like sugarcane.
// type, typeAbove, and typeBelow are arrays containing ints of the block.type to find
// meta, metaAbove, and metaBelow are arrays containing ints of the block.metadata to find
// orientation can be [0 or null] or [1 or greater] to switch the direction of the lanes
//    0: rows going -x to +x
//    1: rows going -z to +z
// If the bot jumps between rows instead of going stright down one row, try changing the orientation :P
// The function searches blocks at the bots location, being where the bot's legs are as the center.
// returns the block found on the same height as the bot's legs, regaurdless of wether typeabove or typebelow are given.
function searchLane(type, typeAbove, typeBelow, meta, metaAbove, metaBelow, orientation) {
  if (!type){type = 0}
  if (!orientation){orientation = 0}

  var y = 0

  for (z = 0; z < 20; z = z+1) {
    for (x = 0; x < z*4; x = x+1) {
      //~ console.log(x+", "+z)
      for (modx = -1; modx < 2; modx = modx +2) {
        if (x == 0 && modx == 1){break}
        for (modz = -1; modz < 2; modz = modz +2) {
          if (z == 0 && modz == 1){break}

          if (orientation == 0){
            block  = bot.blockAt(  bot.entity.position.offset( modx*x, y-0, modz*z)  )
            blockBelow = bot.blockAt(  bot.entity.position.offset( modx*x, y-1, modz*z)  )
            blockAbove = bot.blockAt(  bot.entity.position.offset( modx*x, y+1, modz*z)  )
          } else { // this code switches the direction
            block  = bot.blockAt(  bot.entity.position.offset( modz*z, y-0, modx*x)  )
            blockBelow = bot.blockAt(  bot.entity.position.offset( modz*z, y-1, modx*x)  )
            blockAbove = bot.blockAt(  bot.entity.position.offset( modz*z, y+1, modx*x)  )
          }
          //~ console.log(modx*x+", "+y+", "+modz*z+"    "+block.type)

          if (block && type.indexOf(block.type) > -1 && (!typeAbove || (blockAbove && typeAbove && typeAbove.indexOf(blockAbove.type) > -1)) && (!typeBelow || (blockBelow && typeBelow && typeBelow.indexOf(blockBelow.type) > -1))  ) {
            if (!meta || (meta.indexOf(block.metadata) > -1 && (!metaAbove || (blockAbove && metaAbove && metaAbove.indexOf(blockAbove.metadata) > -1)) && (!metaBelow || (blockBelow && metaBelow && metaBelow.indexOf(blockBelow.metadata) > -1)) )  ) {
              console.log("+    Found!   Block: "+block.type+":"+block.metadata+"   Below: "+blockBelow.type+":"+blockBelow.metadata+"   Top: "+blockAbove.type+":"+blockAbove.metadata)
              return block
            }
          }

        } // for mody
      } // for modx
    } // for x
  } // for y
  return null
} // searchLane

function dig(tryNum) {
  if (!tryNum){tryNum = 1}
  if (tryNum > 10){console.log("Cobble ain't coming back!"), bot.end() }
	//~ console.log("Dig called")
  if(bot.targetDigBlock) {
    console.log("  already digging " + bot.targetDigBlock.name);
  } else {
    //~ var target = bot.blockAt(bot.entity.position.offset(0, 1, 2));
    //~ if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, 3))}
    //~ if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, 4))}

    var target = bot.blockAt(bot.entity.position.offset(0, 1, -2));
    if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, -3))}
    if ( !target || target.type != 4 || !target.harvestTools) {target = bot.blockAt(bot.entity.position.offset(0, 1, -4))}
    if ( !target || target.type != 4 || !target.harvestTools) {console.log("All blocks dug?"); return setTimeout( function(){dig(tryNum+1)} , 1000)}


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
          }, 200)
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




function emptyInv(list, callback, notFirst) {
  if (!notFirst){
    console.log("Dumping items from inventory not on this list:")
    console.log(list)
  }

  for (var i=0; i<bot.inventory.items().length; i++) {
    if (list.indexOf( bot.inventory.items()[i].type.toString() ) == -1){
      console.log("List does not contain item "+bot.inventory.items()[i].type)
      return bot.tossStack(bot.inventory.items()[i], function(){
        setTimeout(emptyInv(list, callback, 1), 40)
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

function sayItems(items) {
  items = items || bot.inventory.items();
  var output = items.map(itemToString).join(', ');
  if(output) {
    console.log(output)
  } else {
    console.log("empty");
  }
}

function itemToString(item) {
  if(item) {
    return item.type + " x " + item.count;
  } else {
    return "(nothing)";
  }
}




