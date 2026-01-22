import React from 'react'
import Imp from './Imp'

export default function Data(props) {
  // const getname=(name)=>{
  //    console.log(name)
  // }
  return (
    <div>
      <h1>{props.name}</h1>
      <Imp name={props.name}></Imp>
    </div>
  )
}
