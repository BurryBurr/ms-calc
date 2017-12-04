import img from '../../assets/jobs/new_magician.png'
import React from 'react'

import { Mobs } from '../Util'

export default class Magician {
  constructor() {
    this.info = {
      enabled: true,
      name: 'Magician',
      img: img
    }

    let sharpEyesOptions = []
    for(let i = 1; i <= 30; i++) {
      sharpEyesOptions.push({value: i, name: i})
    }

    this.form = {
      mob: {type: 'hidden', req: true},
      level: {
        label: 'Level',
        type: 'number',
        req: true
      },
      int: {
        label: 'Int',
        type: 'number',
        req: true
      },
      luk: {
        label: 'Luk',
        type: 'number',
        req: true
      },
      magic: {
        label: 'Total Magic',
        type: 'number',
        req: true
      },
      skillMagic: {
        label: 'Skill Magic Attack',
        type: 'number',
        req: true
      },
      maMastery: {
        label: 'Skill Mastery',
        type: 'select',
        options: [
          {value: 0.25, name: 'Initial (25%)'},
          {value: 0.75, name: 'Maxed Skill (25% + 50%)', selected: true}
        ],
        req: true
      },
      wandBonus: {
        label: 'Elemental Wand Bonus',
        type: 'select',
        options: [
          {value: 1.00, name: 'No Bonus', selected: true},
          {value: 1.05, name: '5% Bonus'},
          {value: 1.10, name: '10% Bonus'}
        ],
        req: true
      },
      sharpEyes: {
        label: 'Sharp Eyes Level',
        type: 'select',
        options: [
          {value: 0, name: 'No Sharp Eyes', selected: true},
          ...sharpEyesOptions
        ]
      }
    }

    this.values = {
      maMastery: 0.75,
      wandBonus: 1.00
    }

    this.tips = <ul className="tips">
      <li><strong>Total Magic</strong><img src={require('../../assets/magician_tips/tma.png')} alt="total magic"/></li>
      <li><strong>Skill Magic Attack</strong><img src={require('../../assets/magician_tips/matt.png')} alt="skill magic"/></li>
      <li><strong>Skill Mastery</strong><img src={require('../../assets/magician_tips/mastery.png')} alt="skill magic"/></li>
    </ul>
  }

  damage() {
    for(let formField in this.form) {
      if(this.form[formField].req && this.values[formField] == undefined) return {max: -1}
    }

    let { level, int, luk, magic, skillMagic, maMastery, wandBonus, mob, sharpEyes } = this.values

    level = parseInt(level)
    int = parseInt(int)
    luk = parseInt(luk)
    magic = parseInt(magic)
    skillMagic = parseFloat(skillMagic)
    maMastery = parseFloat(maMastery)
    wandBonus = parseFloat(wandBonus)
    mob = parseInt(mob)
    sharpEyes = parseInt(sharpEyes)

    let eq1 = ((magic ** 2) / 1000) + magic
    let eq2 = int / 200
    let eq3 = eq1 * maMastery * 0.9

    let max = (eq1/30 + eq2) * skillMagic * wandBonus
    let min = (eq3/30 + eq2) * skillMagic * wandBonus

    // finished basic dmg calculation
    
    let selectedMob = Mobs.getMob(mob)
    let lvDiff = selectedMob.level - level
    if(lvDiff < 0) lvDiff = 0

    max = max - selectedMob.def.magic * 0.5 * (1 + 0.01 * lvDiff)
    min = min - selectedMob.def.magic * 0.6 * (1 + 0.01 * lvDiff)

    // finished mob defense calc
    
    let accToHit = (selectedMob.avoid + 1) * (1 + lvDiff / 24)
    let acc = Math.trunc(int / 10) + Math.trunc(luk / 10)
    let minAcc = accToHit * 10 / 24

    max = Math.max(0, Math.floor(max))
    min = Math.max(0, Math.floor(min))

    acc = Math.floor(acc)
    minAcc = Math.floor(minAcc)
    accToHit = Math.floor(accToHit)

    let critChance = 0
    let critIncrease = 0
    if(sharpEyes > 0) {
      critChance = Math.ceil(sharpEyes / 2) / 100
      critChance = Math.max(0, Math.min(1, critChance))

      critIncrease = 1 + ((10 + sharpEyes) / 100)
      critIncrease = Math.max(1, Math.min(2, critIncrease))
    }

    return {
      max, min,
      acc: {
        acc, minAcc, accToHit
      },
      crit: {
        chance: critChance,
        increase: critIncrease
      }
    }
  }
}