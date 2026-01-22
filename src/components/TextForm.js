
import React,{useState} from 'react'



export default function TextForm(props) {
    const handleupclick=()=>{
        // console.log("Uppercase was click  " + text)
        let newText= text.toUpperCase();
        setText(newText)
        props.showAlert("Converted to uppercase" , "success");
    }

    const handlelowclick = ()=>{
        let lowtext= text.toLowerCase();
        setText(lowtext)
        props.showAlert("Converted to lowercase" , "success");
    }

    const Clear=() =>{
        setText("")
        props.showAlert("Text cleared" , "success");
    }

    const reverstext= () =>{
        let c="";
        for(let i=text.length-1;i>=0;i--)
        {
            c=c+text[i];
        }
        setText(c)
        props.showAlert("Text reverse", "success");
    }

    const copytext =() =>{
        let text=document.getElementById('mybox');
        text.select();
        navigator.clipboard.writeText(text.value)
        document.getSelection().removeAllRanges()
        props.showAlert("Text copied" , "success");
    }

    const handleextraspace =() =>{
        let newtext= text.split(/[ ]+/);
        setText(newtext.join(" "))
        props.showAlert("Extra space removed" , "success");
    }

    const handleonchange=(event)=>{
        // console.log("On change")
        setText(event.target.value)
    }
    const [text,setText] = useState("");

    // text="new text";  // wroung way to change the state
    // setText("new text");  // wroung way to change the state
  return (

    <>
        <div className='container' style={{color: props.mode==='light'?'black':'white'}}>
        <h1 className='mb-3'>{props.heading}</h1>
        <div className="mb-3">
        <textarea className="form-control" value={text} style={{backgroundColor: props.mode==='light'?'white':'#13466e',color: props.mode==='light'?'black':'white'}} onChange={handleonchange} id="mybox" rows="10"></textarea>
        </div>
        <button disabled={text.length===0} className="btn btn-primary mx-2  my-1" onClick={handleupclick}>convert to uppercase</button>
        <button disabled={text.length===0} className="btn btn-danger mx-2 my-1" onClick={handlelowclick}>convert to lowercase</button>
        <button disabled={text.length===0} className="btn btn-danger mx-2 my-1" onClick={Clear}>Clear</button>
        <button disabled={text.length===0} className="btn btn-danger mx-2 my-1" onClick={reverstext}>Reverse the text</button>
        <button disabled={text.length===0} className="btn btn-danger mx-2 my-1" onClick={copytext}>Copy Text</button>
        <button disabled={text.length===0} className="btn btn-danger mx-2 my-1" onClick={handleextraspace}>Remove extra spaces</button>
        </div>

        <div className="container my-5 " style={{color: props.mode==='light'?'black':'white'}}>
            <h2>Your text summary</h2>
            <p>{text.split(" ").filter((element)=>{return element.length!==0}).length} Words and {text.length} character</p>
            <p> {0.0008 *text.split(" ").filter((element)=>{return element.length!==0}).length} Minutes required to  read the words </p>
            <h2>Preview</h2>
            <p>{text.length>0?text:"Nothing to preview!"}</p>
        </div>
    </>
    
  )
}
