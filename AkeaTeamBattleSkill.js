
/*:
//=============================================================================
// RPG Maker MZ - Akea Team Battle Skill
//=============================================================================
 * @target MZ
 * @plugindesc Akea Battler After Image
 * @author Reisen (Mauricio Pastana)
 * @url https://www.patreon.com/raizen884

 * @orderAfter AkeaAnimatedBattleSystem

 * @help Akea Team Battle Skill - this plugins is under zlib license
 * For support and new plugins join our discord server! https://discord.gg/Kh9XXZ2
 * Want to support new creations? be a patreon! 
 * To configure this plugin, just go to the parameters and create a new Team Skills Configuration
 * When you create one you will first need to say what skill id it is on the Database.
 * So you can create a kill like usually, then you set it up on the parameters.
 * After that, you will set the group of members who can learn this skill, you can create
 * as many groups as you want starting from 2. Each group can have as many actors as you want.
 * So if you want a skill that uses 4 members of the party, you will need to create 4 groups.
 * 
 * After creating the groups and putting each respective member on it, you will need to
 * add the skills which affects the mp/tp usage of each actor.
 * It needs to have the same length as the group of actors.
 * 
 * Now you are ready to go! If you are using akea and want to make animations for 
 * each party member, do as it follows below.
 * The actor in the first group will be the "anchor", so in the notetags he will be
 * the one that dictates each other member 
 * 
 * The actions are <akeaTeam>action:Name of the action...
 * <akeaTeam>action:Actions teamId:2 id: 8</akeaTeam>
 * this will make the second member of the group do the Actions of id 8
 * 
 * <akeaTeam>action:AniSelf teamId:2 id: 80</akeaTeam>
 * this will play the animation of id 80 on the second member of the group in the parameters
 * 
 * The same will follow using any other action for example.
 * <akeaTeam>action:Hit teamId:3 damage: 230</akeaTeam>
 * This will create a hit using the 3rd member of the group attributes for 230% damage.
 * <akeaTeam>action:HitWeapon teamId:4 damage: 130</akeaTeam>
 * This will create a hit using the 4th member of the group attributes for 130% damage.
 * And showing the weapon animation
 * 
 * You can use basically any action, if an action has not been mapped for team skills just
 * contact me!
 * 
 * 



 * @param Team Skills Configuration
 * @type struct<TeamSkills>[]
 * @text After Images Base Configuration
 * @param learnSkill
 * @type boolean
 * @default true
 * @text Automatic Skill Learn
 * @desc If on you can learn skills automatically if all conditions are met.
*/
/*~struct~TeamSkills:
 * @param skill
 * @type number
 * @default 174
 * @text Skill Id
 * @desc Skill id of the team skill on the database
 * @param members
 * @type number[][]
 * @default [[2], [8]]
 * @text Members Group
 * @desc Group of members, you can add more than 1 actor in each group, you can add as many groups as you want.
 * @param baseSkills
 * @type number[]
 * @default [20, 21]
 * @text Base Skills
 * @desc Base skills for the groups above, these skills are used as bases for mp/tp cost, and skill learning.
 */
// NÃO MEXE AQUI POR FAVOR :(!
// No touching this part!
var Akea = Akea || {};
Akea.BattleTeamSkill = Akea.BattleTeamSkill || {};
Akea.BattleTeamSkill.VERSION = [1, 0, 0];

//if (!Akea.BattleSystem) throw new Error("AkeaBattleAfterImage plugin needs the AkeaAnimatedBattleSystem base.");
//if (Akea.BattleSystem.VERSION < [1, 1, 1]) throw new Error("This plugin only works with versions 1.1.1 or higher of the Akea Animated Battle System ");



const pluginName = "AkeaTeamSkill";
Akea.params = PluginManager.parameters(pluginName);
Akea.BattleTeamSkill.TeamSkillGlobaConfigs = JSON.parse(Akea.params['Team Skills Configuration']);
Akea.BattleTeamSkill.TeamSkillJSON = [];
Akea.BattleTeamSkill.TeamSkill = [];
Akea.BattleTeamSkill.LearSkills = Akea.params['learnSkill'] == "true" ? true : false;
for (const teamSkill of Akea.BattleTeamSkill.TeamSkillGlobaConfigs) { Akea.BattleTeamSkill.TeamSkillJSON.push(JSON.parse(teamSkill)) };
for (const teamSkill of Akea.BattleTeamSkill.TeamSkillJSON) {
    Akea.BattleTeamSkill.TeamSkill.push({
        skill: parseInt(teamSkill.skill), members: JSON.parse(teamSkill.members).map(JSON.parse).map(a => a.map(parseInt)), baseSkill: JSON.parse(teamSkill.baseSkills).map(a => parseInt(a))
    })
};

BattleManager.getAkeaTeamSkill = function () {
    return this._akeaTeamSkills;
}

const _akeaTeamSkill_BattleManager_initMembers = BattleManager.initMembers;
BattleManager.initMembers = function () {
    _akeaTeamSkill_BattleManager_initMembers.call(this, ...arguments);
    this._akeaTeamSkills = new Game_AkeaTeamSkills();
}

const _akeaTeamSkill_BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function () {
    if (BattleManager.getAkeaTeamSkill().hasMember(this._subject)) {
        for (const member of BattleManager.getAkeaTeamSkill().getTeam(this._subject)) {
            this.endBattlerActions(member);
        }
    };
    _akeaTeamSkill_BattleManager_endAction.call(this, ...arguments);
};

const _akeaTeamSkill_BattleManager_endTurn = BattleManager.endTurn;
BattleManager.endTurn = function () {
    _akeaTeamSkill_BattleManager_endTurn.call(this, ...arguments);
    this._akeaTeamSkills.clearTeams();
};

const _akeaTeamSkill_BattleManager_gainRewards = BattleManager.gainRewards;
BattleManager.gainRewards = function () {
    _akeaTeamSkill_BattleManager_gainRewards.call(this, ...arguments);
    if (Akea.BattleTeamSkill.LearSkills)
        this.checkAkeaSkillChange();
};



BattleManager.canUseTeamSkill = function (skill, castingMember) {
    let membersCasting = [];
    const battleMembers = castingMember.isActor() ? $gameParty.battleMembers() : $gameTroop.members();
    for (var n = 0; n < Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == skill.id)[0].members.length; n++) {
        membersCasting[n] = BattleManager.akeaChooseCastingMembers(battleMembers, n, skill.id, this._phase != "input");
        if (membersCasting[n].includes(castingMember)) {
            membersCasting[n] = [castingMember];
        }
        let newItem = Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == skill.id)[0].baseSkill[n]
        membersCasting[n] = membersCasting[n].filter(member => _akeaTeamSkill_Game_BattlerBase_meetsSkillConditions.call(member, $dataSkills[newItem]));
        if (BattleManager.isTpb() && !membersCasting[n].some(member => member.isTpbCharged()))
            return false;
        if (membersCasting[n].length == 0) { return false };
    }
    return true;
};

BattleManager.akeaChooseCastingMembers = function (allMembers, groupNumber, skillId, checkTeam) {
    let members = [];
    const teamMembers = Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == skillId)[0].members
    for (const member of allMembers) {
        if (teamMembers[groupNumber].includes(member.actorId()) && member.hasSkill(skillId) && (checkTeam || !BattleManager.getAkeaTeamSkill().hasMember(member))) {
            members.push(member);
        }
    }
    return members;
};

BattleManager.finishActorInput = function () {
    if (this._currentActor && this._currentActor.currentAction().isSkill() &&
        Akea.BattleTeamSkill.TeamSkill.some(ts => ts.skill == this._currentActor.currentAction().item().id)) {
        BattleManager.useTeamSkill(this._currentActor.currentAction().item(), BattleManager.actor());
        if (BattleManager.isTpb()) {
            this._currentActor = BattleManager.getAkeaTeamSkill().getTeam(this._currentActor)[0]
            for (var n = 1; n < BattleManager.getAkeaTeamSkill().getTeam(this._currentActor).length; n++) {
                BattleManager.endBattlerActions(BattleManager.getAkeaTeamSkill().getTeam(this._currentActor)[n])
            }
        }
    }
    if (this._currentActor) {
        if (this.isTpb()) {
            this._currentActor.startTpbCasting();
        }
        this._currentActor.setActionState("waiting");
    }
};

BattleManager.changeCurrentActor = function (forward) {
    const members = $gameParty.battleMembers();
    let actor = this._currentActor;
    for (; ;) {
        const currentIndex = members.indexOf(actor);
        actor = members[currentIndex + (forward ? 1 : -1)];
        if (!actor || actor.canInput()) {
            break;
        }
    }
    this._currentActor = actor ? actor : null;
    BattleManager.getAkeaTeamSkill().removeTeam(this._currentActor);
    this.startActorInput();
};
BattleManager.useTeamSkill = function (skill, castingMember) {
    let membersCasting = [];
    const battleMembers = castingMember.isActor() ? $gameParty.battleMembers() : $gameTroop.members();
    for (let n = 0; n < Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == skill.id)[0].members.length; n++) {
        membersCasting[n] = this.akeaChooseCastingMembers(battleMembers, n, skill.id);
        if (membersCasting[n].includes(castingMember)) {
            membersCasting[n] = [castingMember];
        }
        let newItem = Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == skill.id)[0].baseSkill[n]
        membersCasting[n] = membersCasting[n].filter(member => _akeaTeamSkill_Game_BattlerBase_meetsSkillConditions.call(member, $dataSkills[newItem]));
        if (membersCasting[n].length == 0) { return false };
        membersCasting[n] = membersCasting[n][0];
    }
    membersCasting = membersCasting.flat().sort(function compare(a, b) {
        if ($gameParty.battleMembers().indexOf(a) > $gameParty.battleMembers().indexOf(b)) return 1;
        if ($gameParty.battleMembers().indexOf(b) > $gameParty.battleMembers().indexOf(a)) return -1;
        return 0;
    })
    for (let n = 0; n < membersCasting.length; n++) {
        membersCasting[n].setAkeaTeamSkillIndex(n);
        if (n == 0) {
            membersCasting[n].setAction(0, castingMember.action(0));
        }
        else {
            let newItem = Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == skill.id)[0].baseSkill[n]
            _akeaTeamSkill_Game_Battler_useItem.call(membersCasting[n], $dataSkills[newItem]);
            membersCasting[n].makeActions();
        }



    }
    BattleManager.getAkeaTeamSkill().addNewTeam(membersCasting);
};
const _akeaTeamSkill_Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
Game_BattlerBase.prototype.meetsSkillConditions = function (skill) {
    if (Akea.BattleTeamSkill.TeamSkill.some(ts => ts.skill == skill.id)) {// Create condition to check if it is a team Skill
        return BattleManager.canUseTeamSkill(skill, this);
    }
    return _akeaTeamSkill_Game_BattlerBase_meetsSkillConditions.call(this, ...arguments);
};

const _akeaTeamSkill_Game_BattlerBase_canInput = Game_BattlerBase.prototype.canInput;
Game_BattlerBase.prototype.canInput = function () {
    return this.akeaFirstTeamBattleSkill() && _akeaTeamSkill_Game_BattlerBase_canInput.call(this, ...arguments);
};

Game_BattlerBase.prototype.akeaFirstTeamBattleSkill = function () {
    return this.getAkeaTeamSkill() <= 0;
}
Game_BattlerBase.prototype.setAkeaTeamSkillIndex = function (index) {
    this._akeaTeamSkillIndex = index;
}
Game_BattlerBase.prototype.getAkeaTeamSkill = function () {
    return this._akeaTeamSkillIndex;
}

const _akeaTeamSkill_Game_BattlerBase_initialize = Game_BattlerBase.prototype.initialize;
Game_BattlerBase.prototype.initialize = function () {
    _akeaTeamSkill_Game_BattlerBase_initialize.call(this, ...arguments);
    this._akeaTeamSkillIndex = -1;
};

Game_Battler.prototype.setAction = function (index, action) {
    this._actions[index] = action;
};
const _akeaTeamSkill_Game_BattlerBase_canUse = Game_BattlerBase.prototype.canUse;
Game_BattlerBase.prototype.canUse = function (item) {
    if (!item) { return false; }
    let canUse = true;
    if (BattleManager.getAkeaTeamSkill().hasMember(this)) {
        if (BattleManager.isTpb() && BattleManager.getAkeaTeamSkill().hasMember(this)) { return true };
        for (const member of BattleManager.getAkeaTeamSkill().getTeam(this)) {
            canUse = canUse && _akeaTeamSkill_Game_BattlerBase_canUse.call(member, item);
        }
    } else {
        canUse = _akeaTeamSkill_Game_BattlerBase_canUse.call(this, ...arguments);
    }
    return canUse;
};
//-----------------------------------------------------------------------------
// Game_AkeaTeamSkills
//
// The game object class for managing the after images.
//-----------------------------------------------------------------------------
function Game_AkeaTeamSkills() {
    this.initialize(...arguments);
}

Game_AkeaTeamSkills.prototype.initialize = function () {
    this._teamUps = [];
};

Game_AkeaTeamSkills.prototype.clearTeams = function () {
    for (const team of this._teamUps) {
        for (const member of team) {
            member.setAkeaTeamSkillIndex(-1);
        }
    }
    this._teamUps = [];
};

Game_AkeaTeamSkills.prototype.addNewTeam = function (members) {
    this._teamUps.push(members);
};

Game_AkeaTeamSkills.prototype.hasMember = function (member) {
    for (const team of this._teamUps) {
        if (team.includes(member)) {
            return true;
        }
    }
    return false;
};

Game_AkeaTeamSkills.prototype.getTeam = function (member) {
    for (const team of this._teamUps) {
        if (team.includes(member)) {
            return team;
        }
    }
    return false;
};

Game_AkeaTeamSkills.prototype.removeTeam = function (removingMember) {
    for (const team of this._teamUps) {
        if (team.includes(removingMember)) {
            for (const member of team) {
                member.setAkeaTeamSkillIndex(-1);
            }
            this._teamUps.remove(team);
        }

    }
};

const _akeaTeamSkill_Window_BattleLog_startAction = Window_BattleLog.prototype.startAction;
Window_BattleLog.prototype.startAction = function (subject, action, targets) {
    if (BattleManager.getAkeaTeamSkill().hasMember(subject)) {
        this.processTeamSkill(subject, action, targets);
        if (BattleManager.isTpb())
            BattleManager.getAkeaTeamSkill().clearTeams();
    } else {
        _akeaTeamSkill_Window_BattleLog_startAction.call(this, ...arguments);
    }
};

Window_BattleLog.prototype.processTeamSkill = function (subject, action, targets) {
    const item = action.item();
    const team = BattleManager.getAkeaTeamSkill().getTeam(subject);
    for (const member of team) { this.push("performActionStart", member, action) };
    this.push("waitForMovement");
    for (const member of team) { this.push("performAction", member, action) };
    for (const member of team) { this.push("showAnimation", member, targets.clone(), item.animationId) };
    for (const member of team) { this.displayAction(member, item) };

}

Game_Action.prototype.isValid = function () {
    return (this._forcing && this.item()) || this.subject().canUse(this.item());
};

const _akeaTeamSkill_Game_Battler_useItem = Game_Battler.prototype.useItem;
Game_Battler.prototype.useItem = function (item) {
    if (BattleManager.getAkeaTeamSkill().hasMember(this)) {
        for (const member of BattleManager.getAkeaTeamSkill().getTeam(this)) {
            let newItem = Akea.BattleTeamSkill.TeamSkill.filter(ts => ts.skill == item.id)[0].baseSkill[member.getAkeaTeamSkill()]
            _akeaTeamSkill_Game_Battler_useItem.call(member, $dataSkills[newItem]);
        }
    } else {

        _akeaTeamSkill_Game_Battler_useItem.call(this, ...arguments);
    }
};
const _akeaTeamSkill_Game_Battler_callAkeaActions = Game_Battler.prototype.callAkeaActions;
Game_Battler.prototype.callAkeaActions = function (actionName, parameters, action, targets) {
    _akeaTeamSkill_Game_Battler_callAkeaActions.call(this, ...arguments);
    let regex = /(\w+):\s*([^\s]*)/gm;
    let obj = {};
    let param;
    let id;
    do {
        param = regex.exec(parameters);
        if (param) {
            if (RegExp.$1 == "id" || RegExp.$1 == "damage") {
                id = parseInt(RegExp.$2);
            } else {
                obj[RegExp.$1] = RegExp.$2;
            }
        }
    } while (param);
    if (!obj.teamId) { obj.teamId = 1 };
    if (actionName == "Team") {
        const subject = BattleManager.getAkeaTeamSkill().getTeam(this)[obj.teamId - 1]
        subject.initialTargets = this.initialTargets;
        this._akeaAnimatedBSActions.addCustomAddon(id, targets, "Team".concat(obj["action"]), subject, action, obj);
    }

};
const _akeaTeamSkill_Sprite_Battler_manageAkeaActions = Sprite_Battler.prototype.manageAkeaActions
Sprite_Battler.prototype.manageAkeaActions = function (action) {
    _akeaTeamSkill_Sprite_Battler_manageAkeaActions.call(this, ...arguments);
    switch (action.getActionType()) {
        case "TeamActions":
            const params = action.getObject();
            moveAction = action.getAction();
            action.getSubject()._akeaAnimatedBSActions.addAkeaSkillActions(action.getId(), action.getTargets(), action.getActionType().replace("Team", ""), moveAction);
            break;
        case "TeamHitWeapon":
        case "TeamHit":
            action.getSubject()._akeaAnimatedBSActions.addAkeaHit(action.getId(), action.getTargets(), action.getActionType().replace("Team", ""), action.getSubject(), action.getAction());
            break;
        case "TeamHitAll":
            action.getSubject()._akeaAnimatedBSActions.addAkeaHit(action.getId(), action.getTargets(), action.getActionType().replace("Team", ""), action.getSubject(), action.getAction());
            break;
        case "TeamAniSelf":
            action.getSubject()._akeaAnimatedBSActions.addAkeaAnimation(action.getId(), [action.getSubject()], action.getActionType().replace("Team", ""), action.getAction());
            break;
        case "TeamAfterImage":
            action.getSubject()._akeaAnimatedBSActions.addCustomAddon(action.getId(), action.getTargets(), action.getActionType().replace("Team", ""), action.getSubject(), action.getAction(), action.getObject());
            break;
        case "TeamStopAfterImage":
            action.getSubject()._akeaAnimatedBSActions.addCustomAddon(action.getId(), action.getTargets(), action.getActionType().replace("Team", ""), action.getSubject(), action.getAction(), action.getObject());
            break;
    }
}


BattleManager.checkAkeaSkillChange = function () {
    for (const teamSkill of Akea.BattleTeamSkill.TeamSkill) {
        let canLearn = true;
        for (const members of teamSkill.members) {
            if (!$gameParty.members().some(actor => members.includes(actor.actorId()))) { canLearn = false };
        }
        if (canLearn) {
            for (const members of teamSkill.members) {
                for (const member of members) {
                    for (const actor of $gameParty.members().filter(actor => actor.actorId() == member)) {
                        actor.learnSkill(teamSkill.skill)
                    }
                }
            }
        }
    }
};