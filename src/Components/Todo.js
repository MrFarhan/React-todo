import firebase from 'firebase'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import '../App.css';


export const Todo = () => {
    const uID = firebase.auth().currentUser?.uid;
    let history = useHistory();
    const [inputVal, setInputVal] = useState("")
    const [arr, setArr] = useState([])
    const [editIndex, setEditIndex] = useState()
    const [data, setData] = useState([[]]);
    const [redo, setRedo] = useState([[]]);
    const [userName, setUserName] = useState()

    useEffect(() => {
        firebase.database().ref('Todo/' + uID + "/Data").on('value', function (snapshot) {
            var dbData = (snapshot.val()) ? snapshot.val() : [];
            setArr(dbData)
        });
        firebase.database().ref('Todo/' + uID + "/Undo").on('value', function (snapshot) {
            var dbData = (snapshot.val()) ? snapshot.val() : [];
            setData(dbData)
        });
        firebase.database().ref('Todo/' + uID + "/Redo").on('value', function (snapshot) {
            var dbData = (snapshot.val()) ? snapshot.val() : [];
            setRedo(dbData)
        });
        firebase.database().ref(`Users/${firebase.auth().currentUser?.uid}/userName`).on("value", (res) => setUserName(res.val()))


        //eslint-disable-next-line
    }, [])

    //FUNCTIONS 
    const Add = () => {
        let temp = [...arr]
        if (inputVal?.trim().length) {
            let temp1 = data?.length ? [...data] : [""]
            if (temp.length)
                temp1?.unshift(temp)
            firebase.database().ref('Todo/' + uID + "/Undo").set(temp1)
                .then(() => {
                    temp.push(inputVal?.toUpperCase())
                    firebase.database().ref('Todo/' + uID + "/Data").set(temp)
                    setInputVal("")
                })
        }
    }




    const Delete = (DeleteIndex) => {
        let temp = [...arr]
        let temp1 = [...data]
        temp1.unshift(arr)
        firebase.database().ref('Todo/' + uID + "/Undo").set(temp1)
        temp = temp.filter((value, index) => index !== DeleteIndex)
        firebase.database().ref('Todo/' + uID + "/Data").set(temp);
        setInputVal("")

    }

    const Edit = (Editvalue, EditIndex) => {
        let temp = [...arr]
        setInputVal(temp[EditIndex])
        setEditIndex(EditIndex)

    }

    const Update = () => {
        if (inputVal.trim().length) {
            let temp = [...arr]
            let temp1 = [...data]
            temp1.unshift(arr)
            firebase.database().ref('Todo/' + uID + "/Undo").set(temp1)
            temp[editIndex] = inputVal?.toUpperCase()
            firebase.database().ref('Todo/' + uID + "/Data").set(temp);
            setEditIndex(false)
            setInputVal("")
        }
    }

    const Deleteall = () => {
        let temp1 = [...data]
        temp1.unshift(arr)
        firebase.database().ref('Todo/' + uID + "/Undo").set(temp1)
        let temp = [...arr]
        temp = []
        setArr(temp)
        firebase.database().ref('Todo/' + uID + "/Data").remove();

    }


    const Undo = () => {
        let temp1 = data.length ? [...data] : [""]
        let temp2 = [...redo]
        console.log(temp1, "temp 1")
        if (temp1.length) {
            if (arr.length)
                temp2.unshift(arr)
            firebase.database().ref('Todo/' + uID + "/Redo").set(temp2)
                .then(() => {
                    firebase.database().ref('Todo/' + uID + "/Data").set(temp1[0])
                        .then(() => {
                            if (data.length)
                                temp1.shift()
                            firebase.database().ref('Todo/' + uID + "/Undo").set(temp1)
                        })
                })

        }
    }

    const Redo = () => {
        let temp1 = [...redo]
        let temp2 = data?.length ? [...data] : [""]
        let temp3 = arr.length ? [...arr] : [""]
        if (temp1.length) {
            if (arr.length)
                temp2.unshift(temp3)
            firebase.database().ref('Todo/' + uID + "/Undo").set(temp2)
                .then(() => {
                    firebase.database().ref('Todo/' + uID + "/Data").set(temp1[0])
                        .then(() => {
                            temp1.shift()
                            firebase.database().ref('Todo/' + uID + "/Redo").set(temp1)
                        })
                })
        }
    }

    const Signout = () => {
        firebase.auth().signOut()
        history.replace("/")


    }

     return (





        /* eslint-disable-line no-script-url */
        <div className="todo_heading">
            <span>Signed in as: {userName} </span>

            <h1>Todo</h1>
            <div className="todo">


                <form onSubmit={(e) => e.preventDefault()} >

                    <input type="text" onChange={((e) => setInputVal(e.target.value))} value={inputVal} autoFocus={true} /><br /><br />
                    {arr.map((value, index) => {
                        return <div key={index}>{value}  <span onClick={() => Delete(index)} className="delete">X</span><input type="button" onClick={() => Edit(value, index)} value="Edit" className="edit" /> </div>
                    })}
                    <br /><br />        {editIndex || editIndex === 0 ? <input type="submit" onClick={() => Update()} value="Update" /> : <button onClick={() => Add()}>Add</button>}
                    <input type="button" onClick={Deleteall} value="Delete all" />
                    <input type="button" value="Undo" onClick={Undo} />
                    <input type="button" value="Redo" onClick={Redo} />
                    <input type="button" value="Log Out" onClick={Signout} />


                </form>
            </div>
        </div>
    )
}
