//==========================================================================
// Akea - Visual Weapons
//----------------------------------------------------------------------------
// 04/10/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.0.0] Use custom graphics for each weapon in battle.
 * @author Gabe (Gabriel Nascimento)
 * @url http://patreon.com/gabriel_nfd
 * @base AkeaAnimatedBattleSystem
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea - Battle Camera
 *  - This plugin is released under the zlib License.
 *  - This plugin requires the AkeaAnimatedBattleSystem base plugin.
 * 
 * This plugin allows each weapon to have its own graphics during battle. 
 * Following the Holder's format, it's possible to define two layers of 
 * graphics for each weapon. One below the actor's spritesheet and one above. 
 * 
 * To define the graphics of a specific weapon, just configure it in the plugin 
 * parameters.
 * 
 * The graphics must be inserted in the following directory: img/sv_weapons/
 * 
 * For support and new plugins join our Discord server: 
 * https://discord.gg/GG85QRz
 * 
 * @param weaponSettings
 * @text Weapon Settings
 * @desc Set here the Weapon settings here.
 * @type struct<weaponSettingsStruct>[]
 */

 /*~struct~weaponSettingsStruct:
 * @param id
 * @text Weapon ID
 * @desc Set the weapon ID.
 * @type weapon
 * @default 1
 * 
 * @param filename
 * @text Weapon Bellow Image
 * @desc Set the weapon image filename.
 * @type file
 * @dir img/sv_weapons
 * 
 * @param aboveFilename
 * @text Weapon Above Image
 * @desc Set the weapon above image filename.
 * @type file
 * @dir img/sv_weapons
 */

var Imported = Imported || {};
Imported.Akea_VisualWeapons = true;

var Akea = Akea || {};
Akea.VisualWeapons = Akea.VisualWeapons || {};
Akea.VisualWeapons.VERSION = [1, 0, 0];

if (!Akea.BattleSystem) throw new Error("Akea Visual Weapons plugin needs the Akea Animated Battle System base.");
if (Akea.BattleSystem.VERSION < [1, 1, 0]) throw new Error("Akea Visual Weapons plugin only works with versions 1.1.0 or higher of the Akea Animated Battle System.");

(() => {

    const pluginName = "AkeaVisualWeapons";
    Akea.params = PluginManager.parameters(pluginName);
    Akea.VisualWeapons.weaponSettings = JSON.parse(Akea.params.weaponSettings);
    Akea.VisualWeapons.weapons = [];
    Akea.VisualWeapons.weaponSettings.forEach(weapon => {
        weapon = JSON.parse(weapon);
        settings = {
            id: parseInt(weapon.id),
            filename: weapon.filename,
            aboveFilename: weapon.aboveFilename
        }
        Akea.VisualWeapons.weapons.push(settings)
    });

    //-----------------------------------------------------------------------------
    // ImageManager
    //
    // The static class that loads images, creates bitmap objects and retains them.

    ImageManager.loadSvWeapon = function(filename) {
        return this.loadBitmap("img/sv_weapons/", filename);
    };

    //-----------------------------------------------------------------------------
    // Sprite_Actor
    //
    // The sprite for displaying an actor.

    Sprite_Actor.prototype.updateBitmap = function() {
        Sprite_Battler.prototype.updateBitmap.call(this);
        const actorName = this._actor.battlerName();
        const weaponId = this._actor.weapons()[0].id;
        if (this._battlerName !== actorName || this._weaponId !== weaponId) {
            this._battlerName = actorName;
            this._weaponId = weaponId;
            const actorBitmap = ImageManager.loadSvActor(this._battlerName)
            const weaponSettings = Akea.VisualWeapons.weapons.find(weapon => weapon.id == this._weaponId);
            if (weaponSettings) {
                if (this._mainSprite.bitmap) this._mainSprite.bitmap.clear();
                const aboveBitmap = ImageManager.loadSvWeapon(weaponSettings.aboveFilename);
                const weaponBitmap = ImageManager.loadSvWeapon(weaponSettings.filename);
                actorBitmap.addLoadListener(() => {
                    weaponBitmap.addLoadListener(() => {
                        aboveBitmap.addLoadListener(() => {
                            weaponBitmap.blt(actorBitmap, 0, 0, actorBitmap.width, actorBitmap.height, 0, 0);
                            weaponBitmap.blt(aboveBitmap, 0, 0, weaponBitmap.width, weaponBitmap.height, 0, 0);
                            this._mainSprite.bitmap = weaponBitmap;
                        });
                    });
                });
            } else {
                this._mainSprite.bitmap = actorBitmap;
            }
        }
    };

})();