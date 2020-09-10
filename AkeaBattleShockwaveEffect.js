//==========================================================================
// Akea - Battle Shockwave Effect
//----------------------------------------------------------------------------
// 02/08/20 | Version: 1.0.0
// This software is released under the zlib License.
//============================================================================
/*:
 * @target MZ
 * @plugindesc Akea - Battle Shockwave Effect
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884
 * @base AkeaAnimatedBattleSystem
 * @orderAfter AkeaAnimatedBattleSystem
 * 
 * @help Akea - Battle Shockwave Effect - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 
 * 
 * powered by shockwave filter
 * pixi/filter-shockwave - v3.1.0
 * Compiled Wed, 11 Mar 2020 20:38:18 UTC
 *
 * pixi/filter-shockwave is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license

 * Battle System Akea - Battle Shockwave Effect works on :
 * - Akea Animated Battle System
 * 
 * This plugin will allow shockwave effects on battle! Make amazing effects with this 
 * add-on!
 * Below each notetag and what it does
 * Skill Notes Tag:
 *   <akeaShockwaveUser>
 *   speed: number (optional, 5 is default if not configured)
 *   brightness: number (optional, 0.9 is default if not configured)
 *   wavelength: number (optional, 300 is default)
 *   </akeaShockwaveUser>
 *       | Creates a shockwave effect on the user.
 *       | speed: The speed the wave will travel
 *       | brightness: how bright is the shockwave from 0-1, the closer to 0, the darker it is.
 *       | wavelength: how thick is the wavelength in pixels
 *
 *   <akeaShockwaveTarget>
 *   speed: number (optional, 5 is default if not configured)
 *   brightness: number (optional, 0.9 is default if not configured)
 *   wavelength: number (optional, 300 is default)
 *   </akeaShockwaveTarget>
 *       | Creates a shockwave effect on the target.
 *       | speed: The speed the wave will travel
 *       | brightness: how bright is the shockwave from 0-1, the closer to 0, the darker it is.
 *       | wavelength: how thick is the wavelength in pixels
 *
 *   <akeaShockwaveAbsolute>
 *   speed: number (optional, 5 is default if not configured)
 *   brightness: number (optional, 0.9 is default if not configured)
 *   wavelength: number (optional, 300 is default)
 *   x: number
 *   y: number
 *   </akeaShockwaveAbsolute>
 *       | Creates a shockwave effect on the screen at any give point.
 *       | speed: The speed the wave will travel
 *       | brightness: how bright is the shockwave from 0-1, the closer to 0, the darker it is.
 *       | wavelength: how thick is the wavelength in pixels
 *       | x: x position of the center of the shockwave
 *       | y: y position of the center of the shockwave

/*!

 */

 // Please do not modify here!
 
var Akea = Akea || {};
Akea.BattleShockwave = Akea.BattleShockwave || {};
Akea.BattleShockwave.VERSION = [1, 0, 0];

if (!Akea.BattleSystem) throw new Error("Akea Battle Shockwave Effect plugin needs the Akea Animated Battle System base.");
if (Akea.BattleSystem.VERSION < [1, 1, 0]) throw new Error("Akea Battle Shockwave Effect plugin only works with versions 1.1.0 or higher of the Akea Animated Battle System.");

(() => {
    var __filters = function (e, t) { "use strict"; var n = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}", r = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\n\nuniform vec2 center;\n\nuniform float amplitude;\nuniform float wavelength;\n// uniform float power;\nuniform float brightness;\nuniform float speed;\nuniform float radius;\n\nuniform float time;\n\nconst float PI = 3.14159;\n\nvoid main()\n{\n    float halfWavelength = wavelength * 0.5 / filterArea.x;\n    float maxRadius = radius / filterArea.x;\n    float currentRadius = time * speed / filterArea.x;\n\n    float fade = 1.0;\n\n    if (maxRadius > 0.0) {\n        if (currentRadius > maxRadius) {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n            return;\n        }\n        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);\n    }\n\n    vec2 dir = vec2(vTextureCoord - center / filterArea.xy);\n    dir.y *= filterArea.y / filterArea.x;\n    float dist = length(dir);\n\n    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {\n        gl_FragColor = texture2D(uSampler, vTextureCoord);\n        return;\n    }\n\n    vec2 diffUV = normalize(dir);\n\n    float diff = (dist - currentRadius) / halfWavelength;\n\n    float p = 1.0 - pow(abs(diff), 2.0);\n\n    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );\n    float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );\n\n    vec2 offset = diffUV * powDiff / filterArea.xy;\n\n    // Do clamp :\n    vec2 coord = vTextureCoord + offset;\n    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    vec4 color = texture2D(uSampler, clampedCoord);\n    if (coord != clampedCoord) {\n        color *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n\n    // No clamp :\n    // gl_FragColor = texture2D(uSampler, vTextureCoord + offset);\n\n    color.rgb *= 1.0 + (brightness - 1.0) * p * fade;\n\n    gl_FragColor = color;\n}\n", i = function (e) { function t(t, i, o) { void 0 === t && (t = [0, 0]), void 0 === i && (i = {}), void 0 === o && (o = 0), e.call(this, n, r), this.center = t, Array.isArray(i) && (console.warn("Deprecated Warning: ShockwaveFilter params Array has been changed to options Object."), i = {}), i = Object.assign({ amplitude: 30, wavelength: 160, brightness: 1, speed: 500, radius: -1 }, i), this.amplitude = i.amplitude, this.wavelength = i.wavelength, this.brightness = i.brightness, this.speed = i.speed, this.radius = i.radius, this.time = o } e && (t.__proto__ = e), t.prototype = Object.create(e && e.prototype), t.prototype.constructor = t; var i = { center: { configurable: !0 }, amplitude: { configurable: !0 }, wavelength: { configurable: !0 }, brightness: { configurable: !0 }, speed: { configurable: !0 }, radius: { configurable: !0 } }; return t.prototype.apply = function (e, t, n, r) { this.uniforms.time = this.time, e.applyFilter(this, t, n, r) }, i.center.get = function () { return this.uniforms.center }, i.center.set = function (e) { this.uniforms.center = e }, i.amplitude.get = function () { return this.uniforms.amplitude }, i.amplitude.set = function (e) { this.uniforms.amplitude = e }, i.wavelength.get = function () { return this.uniforms.wavelength }, i.wavelength.set = function (e) { this.uniforms.wavelength = e }, i.brightness.get = function () { return this.uniforms.brightness }, i.brightness.set = function (e) { this.uniforms.brightness = e }, i.speed.get = function () { return this.uniforms.speed }, i.speed.set = function (e) { this.uniforms.speed = e }, i.radius.get = function () { return this.uniforms.radius }, i.radius.set = function (e) { this.uniforms.radius = e }, Object.defineProperties(t.prototype, i), t }(t.Filter); return e.ShockwaveFilter = i, e }({}, PIXI); Object.assign(PIXI.filters, __filters);

    const _Spriteset_Battle_createBackground = Spriteset_Battle.prototype.createBackground;
    Spriteset_Battle.prototype.createBackground = function () {
        _Spriteset_Battle_createBackground.call(this, ...arguments)
        this.displacementFilterShockBG = new __filters.ShockwaveFilter();
        this.displacementFilterShockBG.time = 6;
        this.displacementFilterShockBG.brightness = 0.9;
        this.displacementFilterShockBG.wavelength = 300;
        this.displacementFilterShockBG.center = [500, 500]
        this._shockwaveSpeed = 0.05;
        this._baseSprite.filters.push(this.displacementFilterShockBG);
    };
    const _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function () {
        _Spriteset_Battle_update.call(this, ...arguments);
        if (this.displacementFilterShockBG.time < 10)
            this.displacementFilterShockBG.time += this._shockwaveSpeed;
    };

    const _battlerControl_Game_Battler_callAkeaActions = Game_Battler.prototype.callAkeaActions
    Game_Battler.prototype.callAkeaActions = function (actionName, parameters, action, targets) {
        _battlerControl_Game_Battler_callAkeaActions.call(this, ...arguments);
        let regex = /(\w+):\s*([^\s]*)/gm;
        let obj = {};
        let id = false;
        do {
            param = regex.exec(parameters);
            if (param) {
                if (RegExp.$1 == "id") {
                    id = parseInt(RegExp.$2);
                } else {
                    obj[RegExp.$1] = RegExp.$2;
                }
            }
        } while (param);
        if (!id) { id = 1 };
        if (actionName == "ShockwaveUser") {
            this._akeaAnimatedBSActions.addCustomAddon(id, targets, actionName, this, action, obj);
        } else if (actionName == "ShockwaveTarget") {
            this._akeaAnimatedBSActions.addCustomAddon(id, targets, actionName, this, action, obj);
        } else if (actionName == "ShockwaveAbsolute") {
            this._akeaAnimatedBSActions.addCustomAddon(id, targets, actionName, this, action, obj);
        }
    };
    const _battlerControl_Sprite_Battler_manageAkeaActions = Sprite_Battler.prototype.manageAkeaActions
    Sprite_Battler.prototype.manageAkeaActions = function (action) {
        _battlerControl_Sprite_Battler_manageAkeaActions.call(this, ...arguments);
        const obj = action.getObject();
        let speed, brightness, wavelength, x, y;
        switch (action.getActionType()) {
            case "ShockwaveUser":
                speed = parseInt(obj["speed"]) || 5;
                brightness = parseFloat(obj["brightness"]) || 0.5;
                wavelength = parseInt(obj["wavelength"]) || 300;
                x = action.getSubject().screenX();
                y = action.getSubject().screenY();
                BattleManager.callShockwave(speed, brightness, wavelength, x, y);
                break;
            case "ShockwaveTarget":
                speed = parseInt(obj["speed"]) || 5;
                brightness = parseFloat(obj["brightness"]) || 0.5;
                wavelength = parseInt(obj["wavelength"]) || 300;
                x = action.getTargets()[0].screenX();
                y = action.getTargets()[0].screenY();
                BattleManager.callShockwave(speed, brightness, wavelength, x, y);
                break;
            case "ShockwaveAbsolute":
                speed = parseInt(obj["speed"]) || 5;
                brightness = parseFloat(obj["brightness"]) || 0.5;
                wavelength = parseInt(obj["wavelength"]) || 300;
                x = parseInt(obj["x"]) || 0;
                y = parseInt(obj["y"]) || 0;
                BattleManager.callShockwave(speed, brightness, wavelength, x, y);
                break;
        }
    }


    BattleManager.callShockwave = function (speed, brightness, wavelength, x, y) {
        this._spriteset.displacementFilterShockBG.time = 0;
        this._spriteset.displacementFilterShockBG.brightness = brightness;
        this._spriteset.displacementFilterShockBG.wavelength = wavelength;
        this._spriteset.displacementFilterShockBG.center = [x, y]
        this._shockwaveSpeed = speed / 100;
    }
})();