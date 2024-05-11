const en = (raw) => {
  if (raw === 'clear-day') {
    return 'day-sunny'
  }
  raw = raw.replace(/partly-/, '')
  raw = raw.replace(/(\w*)-(\w*)/, '$2-$1')
  return raw
}

const cn = (en) => {
  if (en.includes('cloudy')){
    en = en.replace(/day|night/, '晴')
    en = en.replace(/-/, '转')
    en = en.replace(/cloudy/, '多云')
  }else{
    if (en==='day-sunny') return '晴'
    if (en==='night-clear') return '朗'
  }
  en = en.replace(/rain/, '雨')

  return en
}

export { en, cn }