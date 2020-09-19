//==========================================================================
// Akea - Battle Cry
//----------------------------------------------------------------------------
// 19/09/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Add voices to actors on battle.
 * @author Gabe (Gabriel Nascimento)
 * @url http://patreon.com/gabriel_nfd
 * @base AkeaAnimatedBattleSystem
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea - Battle Cry
 *  - This plugin is released under the zlib License.
 * 
 * This plugin add voices to actors on battle.
 * 
 * How to setup a Battle Cry:
 * 
 * The first step are set the Actor Settings (and Enemy Settings for the 
 * enemies) in this plugin parameters. The definitions are simple, but pay 
 * attention to the base name of the SE file and it's variations number. The 
 * plugin runs the SEs randomly within the maximum number of variations.
 * Works as follows:
 *   | Actor Name + _ + Base Name + Random value
 * Examples:
 *   | Battle Cry Setting: 
 *       | Actor: Reid (01)
 *       | Base Name: Start
 *       | Variance: 4
 *   | This setting may randomly call the following files:
 *       | Reid_Start1
 *       | Reid_Start2
 *       | Reid_Start3
 *       | Reid_Start4
 * 
 * By default, each actor has four settings:
 *   | Start:
 *        | Played at the beginning of the battle.
 * 
 *   | Turn:
 *        | Played at the beginning of the actor turn.
 * 
 *   | Death:
 *        | Played when the actor dies.
 * 
 *   | Win:
 *        | Played when the battle is won.
 * 
 * And it is possible to add as many more settings as desired using the 
 * Custom parameter. All of these settings can be called up in the skills 
 * through your grade, acting in conjunction with the Akea Animated Battle 
 * System.
 * 
 * Skill Notes Tag:
 *   <akeaBattleCry>
 *   action: battleCryName
 *   </akeaBattleCry>
 *       | Plays the battle cry of the specified name
 *       | action: the battle cry name.
 * 
 * Usage Examples:
 *   <akeaBattleCry>
 *   action: CastFire
 *   </akeaBattleCry>
 *       | Plays a random file within the battle cry settings 
 *       | named CastFire.
 * 
 * For support and new plugins join our Discord server: 
 * https://discord.gg/GG85QRz
 * 
 * @param actorSettings
 * @text Actor Settings
 * @desc Actors voice files settings.
 * @type struct<defaultSettingsActor>[]
 * 
 * @param enemySettings
 * @text Enemy Settings
 * @desc Enemies voice files settings.
 * @type struct<defaultSettingsEnemy>[]
 * 
 */

/*~struct~defaultSettingsActor:
 * @param info
 * @text Info
 * @desc A info to distinct this field.
 * @type text
 * 
 * @param actor
 * @text Actor
 * @desc The actor ID.
 * @type actor
 * @default 1
 * 
 * @param start
 * @text Start
 * @desc Played at the beginning of the battle.
 * @type number
 * @default 1
 * 
 * @param turn
 * @text Turn
 * @desc Played at the beginning of the actor turn.
 * @type number
 * @default 1
 * 
 * @param death
 * @text Death
 * @desc Played when the actor dies.
 * @type number
 * @default 1
 * 
 * @param win
 * @text Win
 * @desc Played when the battle is won.
 * @type number
 * @default 1
 * 
 * @param custom
 * @text Custom
 * @type struct<customSettingsActor>[]
 * 
 */

/*~struct~defaultSettingsEnemy:
 * @param info
 * @text Info
 * @desc A info to distinct this field.
 * @type text
 * 
 * @param enemy
 * @text Enemy
 * @desc The enemy ID.
 * @type enemy
 * @default 1
 * 
 * @param custom
 * @text Custom
 * @desc Custom configuration that can be called up through the skill note.
 * @type struct<customSettingsActor>[]
 * 
 */

/*~struct~customSettingsActor:
 * @param name
 * @text Name
 * @desc The custom battle cry name.
 * @type text
 * 
 * @param variation
 * @text Variation
 * @desc The custom battle cry variations.
 * @type number
 * @default 1
 * @min 1
 */

var Akea               = Akea || {};
Akea.BattleCry         = Akea.BattleCry || {};
Akea.BattleCry.VERSION = [1, 0, 0];

if (!Akea.BattleSystem) throw new Error("Akea Battle Camera plugin needs the Akea Animated Battle System base.");
if (Akea.BattleSystem.VERSION < [1, 1, 0]) throw new Error("Akea Battle Camera plugin only works with versions 1.1.0 or higher of the Akea Animated Battle System.");

(() => {

    const pluginName = "AkeaBattleCry";
    Akea.params = PluginManager.parameters(pluginName);

    Akea.BattleCry.actorSettings = JSON.parse(Akea.params.actorSettings);
    Akea.BattleCry.enemySettings = JSON.parse(Akea.params.enemySettings);

    //-----------------------------------------------------------------------------
    // BattleManager
    //
    // The static class that manages battle progress.

    const _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        _BattleManager_startBattle.call(this);
        this.playBattleCry(this.randomAliveMember(), "Start");
    };

    const _BattleManager_startActorInput = BattleManager.startActorInput;
    BattleManager.startActorInput = function() {
        _BattleManager_startActorInput.call(this);
        this.playBattleCry(this._currentActor, "Turn");
    };

    const _BattleManager_processVictory = BattleManager.processVictory;
    BattleManager.processVictory = function() {
        this.playBattleCry(this.randomAliveMember(), "Start");
        _BattleManager_processVictory.call(this);
    };

    BattleManager.playBattleCry = function(actor, actionName) {
        let variation = 0;
        let settings = 0;
        if (actor instanceof Game_Actor) {
            settings = Akea.BattleCry.actorSettings.find(settings => JSON.parse(settings).actor == actor.actorId());
            if (settings) settings = JSON.parse(settings);
        } else if (actor instanceof Game_Enemy) {
            settings = Akea.BattleCry.enemySettings.find(settings => JSON.parse(settings).enemy == actor.enemyId());
            if (settings) settings = JSON.parse(settings);
        }
        if (!settings) return;
        if (settings.custom) {
            const custom = JSON.parse(settings.custom).find(action => JSON.parse(action).name == actionName);
            if (custom) variation = parseInt(JSON.parse(custom).variation);
        }
        if (!variation) variation = parseInt(settings[actionName.toLowerCase()]);
        if (!variation) return;
        const v = Math.floor(Math.random() * variation) + 1;
        const name = `${actor.name()}_${actionName}${v}`;
        const se = {
            name: name,
            volume: 100,
            pitch: 100,
            pan: 0
        }
        AudioManager.playSe(se);
    }

    BattleManager.randomAliveMember = function() {
        const id = Math.floor(Math.random() * $gameParty.aliveMembers().length);
        const actor = $gameParty.aliveMembers()[id];
        return actor;
    }

    //-----------------------------------------------------------------------------
    // Game_Battler
    //
    // The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
    // and actions.

    const _Game_Battler_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function(stateId) {
        _Game_Battler_addState.call(this, stateId);
        if (stateId == this.deathStateId()) BattleManager.playBattleCry(this, "Death");
    };

    const _Game_Battler_callAkeaActions = Game_Battler.prototype.callAkeaActions;
    Game_Battler.prototype.callAkeaActions = function (actionName, parameters, action, targets) {
        _Game_Battler_callAkeaActions.call(this, actionName, parameters, action, targets)
        let regex = /(\w+):\s*([^\s]*)/gm;
        let id = {};
        do {
            param = regex.exec(parameters);
            if (param) {
                id[RegExp.$1] = RegExp.$2;
            }
        } while (param);
            switch (actionName) {
                case "BattleCry":
                    this._akeaAnimatedBSActions.addCustomAddon(id, targets, actionName, this, action);
                    break;
        }
    }

    //-----------------------------------------------------------------------------
    // Sprite_Battler
    //
    // The superclass of Sprite_Actor and Sprite_Enemy.

    const _Sprite_Battler_manageAkeaActions = Sprite_Battler.prototype.manageAkeaActions;
    Sprite_Battler.prototype.manageAkeaActions = function (action) {
        _Sprite_Battler_manageAkeaActions.call(this, action);
        switch (action.getActionType()) {
            case "BattleCry":
                BattleManager.playBattleCry(action.getSubject(), action.getId().action);
                break;
        }
    }

})();