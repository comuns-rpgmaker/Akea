

//==========================================================================
// Akea Battler Position
//----------------------------------------------------------------------------
// 10/10/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc Akea Battler Positions version: 1.0.0
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea Battler Positions - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 

 * This plugin is plug n' play, just insert the plugin and configure the parameters as asked.
 * This plugins makes it so the display on the editor is corresponding to the actual screen size
 * If your game was above 816x624, you usually would have trouble to configure it.
 * If you are using Akea Animated Battle System, do note, the positions of the actors are 
 * configured there.


 * @param posActors
 * @type boolean
 * @text Apply for actors
 * @desc Check here if you want this to apply for actors, choose false if another plugin allows for actor placement
 * @param absActors
 * @type struct<ActorPos>
 * @text Actors Position
 * @desc If you don't want to manually position actors, leave this blank.

*/

/*~struct~ActorPos:
 * @param posX
 * @type text
 * @text Position X formula
 * @default 600 + index * 32
 * @desc index is the index in the battle
 * @param posY
 * @type text
 * @text Position Y formula
 * @default 280 + index * 48
 * @desc index is the index in the battle
*/

// DON'T MODIFY THIS PART!!!
var Akea = Akea || {};
Akea.BattlerPositions = Akea.BattlerPositions || {};
Akea.BattlerPositions.VERSION = [1, 0, 0];

//////////////////////////////////////////////////////////////////////////////////////////////////
//                      Akea Battler Position
//////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------

(() => {
    const pluginName = "AkeaBattlerPositions";
    const parameters = PluginManager.parameters(pluginName);
    Akea.BattlerPositions.ApplyActors = parameters.posActors == "true" ? true : false;
    Akea.BattlerPositions.AbsActors = JSON.parse(parameters.absActors);
    const _Sprite_Actor_setHome = Sprite_Actor.prototype.setHome;
    Sprite_Actor.prototype.setHome = function (x, y) {
        _Sprite_Actor_setHome.call(this, ...arguments);
        if (Akea.BattlerPositions.ApplyActors) {
            this._homeX = Math.floor(this._homeX * Graphics.width / 816);
            this._homeY = Math.floor(this._homeY * Graphics.height / 624);
        }
    };

    const _Sprite_Enemy_setHome = Sprite_Enemy.prototype.setHome;
    Sprite_Enemy.prototype.setHome = function (x, y) {
        _Sprite_Enemy_setHome.call(this, ...arguments);
        this._homeX = Math.floor(this._homeX * Graphics.width / 816);
        this._homeY = Math.floor(this._homeY * Graphics.height / 624);
    };
    if (Akea.BattlerPositions.AbsActors)
        Sprite_Actor.prototype.setActorHome = function (index) {
            this.setHome(eval(Akea.BattlerPositions.AbsActors.posX), eval(Akea.BattlerPositions.AbsActors.posY));
        };
})();