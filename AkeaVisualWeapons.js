//==========================================================================
// Akea - Visual Weapons
//----------------------------------------------------------------------------
// 25/11/23 | Version: 1.0.1 | Fixed the actor graphics duplication bug when they use the same weapon id
// 04/10/20 | Version: 1.0.0 | Released
//----------------------------------------------------------------------------
// This software is released under the zlib License.
//============================================================================

/*:
 * @target MZ
 * @plugindesc [v1.0.1] Use custom graphics for each weapon in battle.
 * @author Gabe (Gabriel Nascimento)
 * @url http://patreon.com/gabriel_nfd
 * @base AkeaAnimatedBattleSystem
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea - Visual Weapons
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
 
     const _Sprite_Actor_initMembers = Sprite_Actor.prototype.initMembers;
     Sprite_Actor.prototype.initMembers = function() {
         _Sprite_Actor_initMembers.call(this);
         this._weaponId = 0;
     }
 
     const _Sprite_Actor_createMainSprite = Sprite_Actor.prototype.createMainSprite;
     Sprite_Actor.prototype.createMainSprite = function() {
         this.createWeaponBellowSprite();
         _Sprite_Actor_createMainSprite.call(this);
         this.createWeaponAboveSprite();
     };
 
     Sprite_Actor.prototype.createWeaponBellowSprite = function() {
         this._weaponBellowSprite = new Sprite();
         this._weaponBellowSprite.anchor.x = 0.5;
         this._weaponBellowSprite.anchor.y = 1;
         this.addChild(this._weaponBellowSprite);
     };
 
     Sprite_Actor.prototype.createWeaponAboveSprite = function() {
         this._weaponAboveSprite = new Sprite();
         this._weaponAboveSprite.anchor.x = 0.5;
         this._weaponAboveSprite.anchor.y = 1;
         this.addChild(this._weaponAboveSprite);
     };
 
     Sprite_Actor.prototype.updateBitmap = function() {
         Sprite_Battler.prototype.updateBitmap.call(this);
         const actorName = this._actor.battlerName();
         const weaponId = this._actor.weapons()[0] ? this._actor.weapons()[0].id : this._weaponId;
         if (this._battlerName !== actorName || this._weaponId !== weaponId) {
             this._battlerName = actorName;
             this._weaponId = weaponId;
             const weaponSettings = Akea.VisualWeapons.weapons.find(weapon => weapon.id == weaponId);
             if (weaponSettings) {
                 this._weaponAboveSprite.bitmap = ImageManager.loadSvWeapon(weaponSettings.aboveFilename);
                 this._weaponBellowSprite.bitmap = ImageManager.loadSvWeapon(weaponSettings.filename);
             }
             this._mainSprite.bitmap = ImageManager.loadSvActor(actorName);
         }
     };
 
 
     
     const _Sprite_Actor_updateFrame = Sprite_Actor.prototype.updateFrame;
     Sprite_Actor.prototype.updateFrame = function() {
         _Sprite_Actor_updateFrame.call(this);
         this.updateWeaponFrames();
     };
 
     Sprite_Actor.prototype.updateWeaponFrames = function() {
         this.updateSpriteFrame(this._weaponBellowSprite);
         this.updateSpriteFrame(this._weaponAboveSprite);
     };
 
     Sprite_Actor.prototype.updateSpriteFrame = function(sprite) {
         const bitmap = sprite.bitmap;
         if (bitmap) {
             const motionIndex = this._motion ? this._motion.index : 0;
             const pattern = this._pattern < this.akeaMaxFrame ? this._pattern : 1;
             const cw = bitmap.width / this.akeaAnimatedBSMaxWidth;
             const ch = bitmap.height / this.akeaAnimatedBSMaxHeight;
             const cx = Math.floor(motionIndex / this.akeaAnimatedBSMaxHeight) * 3 + pattern;
             const cy = motionIndex % this.akeaAnimatedBSMaxHeight;
             sprite.setFrame(cx * cw, cy * ch, cw, ch);
         }
     }
 
 })();