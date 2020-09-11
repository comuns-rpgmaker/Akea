
/*:
//=============================================================================
// RPG Maker MZ - Akea Battle Perspective
//=============================================================================
 * @target MZ
 * @plugindesc Akea Battle Perspective
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @orderAfter AkeaAnimatedBattleSystem

 * @help Akea Battler After Image - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 
 * It is very simple, just configure both parameters and you are ready to go!
 * Do note, you can also change it ingame through a plugin command.
 * 
 * 
 * @param Default Battle Perspective
 * @type struct<Perspective>
 * @text Default Battle Perspective
 * 
 * @command Battle Perspective
 * @text 
 * @desc Configure perspective points for battle
 * 
 * @arg perspective
 * @type struct<Perspective>
*/
/*~struct~Perspective:
 * @param vanishingPoint
 * @type number
 * @default 100
 * @min -1000
 * @text Vanishing Point
 * @desc The higher the closer is the point of view, which means bigger sprites and faster growing
 * @param pointOfView
 * @type number
 * @default 250
 * @min -1000
 * @text Point of View
 * @desc The Higher the further away from the viewer.

 */


// NÃO MEXE AQUI POR FAVOR :(!
// No touching this part!
var Akea = Akea || {};
Akea.BattlePerspective = Akea.BattlePerspective || {};
Akea.BattlePerspective.VERSION = [1, 0, 1];
(() => {
    const pluginName = "AkeaBattlePerspective";
    const akeaBPParameters = PluginManager.parameters('AkeaBattlePerspective');
    const akeaPerspectiveValues = JSON.parse(akeaBPParameters['Default Battle Perspective']);
    Akea.BattlePerspective.vanishingPoint = parseInt(akeaPerspectiveValues.vanishingPoint);
    Akea.BattlePerspective.pointOfView = parseInt(akeaPerspectiveValues.pointOfView);

    PluginManager.registerCommand(pluginName, "Battle Perspective", args => {
        const arg = JSON.parse(args['perspective']);
        Akea.BattlePerspective.vanishingPoint = parseInt(arg.vanishingPoint);
        Akea.BattlePerspective.pointOfView = parseInt(arg.pointOfView);
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //                      Akea Battle Perspective
    //////////////////////////////////////////////////////////////////////////////////////////////////
    //-----------------------------------------------------------------------------

    const _Sprite_Battler_updatePosition = Sprite_Battler.prototype.updatePosition;
    Sprite_Battler.prototype.updatePosition = function () {
        _Sprite_Battler_updatePosition.call(this, ...arguments);
        let invert = this.scale.x > 0 ? false : true;
        this.scale.x = this.scale.y = (this.y - Akea.BattlePerspective.vanishingPoint) / Akea.BattlePerspective.pointOfView;
        if (invert) {
            this.scale.x *= -1
        }

    };
    if (Akea.BattleAfterImage) {
        const _Sprite_Battler_AfterImage_updateAkeaFrame = Sprite_Battler_AfterImage.prototype.updateAkeaFrame;
        Sprite_Battler_AfterImage.prototype.updateAkeaFrame = function () {
            _Sprite_Battler_AfterImage_updateAkeaFrame.call(this, ...arguments);
            let invert = this.scale.x > 0 ? false : true;
            this.scale.x = this.scale.y = (this.y - Akea.BattlePerspective.vanishingPoint) / Akea.BattlePerspective.pointOfView;
            if (invert) { this.scale.x *= -1 }

        }
    }
})();
