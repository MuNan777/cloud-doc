import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface BottomBtnProps {
  text: string,
  colorClass: string,
  icon: IconProp,
  onBtnClick: React.MouseEventHandler<HTMLButtonElement> | undefined
}

const BottomBtn = (props: BottomBtnProps) => {
  const { text, colorClass, icon, onBtnClick } = props
  return (
    <button
      type="button"
      className={`btn btn-block no-border ${colorClass}`}
      onClick={onBtnClick}
    >
      <FontAwesomeIcon
        className="mr-2"
        size="lg"
        icon={icon}
      />
      <span className='ms-3'>{text}</span>
    </button>
  )
}
export default BottomBtn