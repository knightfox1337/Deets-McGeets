<template>
    <main>
        <div class="wrapper">
            <div class="close" id="closeBtn" v-on:click="close"></div>
            <div class="title">Preferences</div>
            
            <form>
                <label for="drive-letter">Drive letter associated with Jungle Disk</label>
                <select name="drive-letter" id="drive-letter">
                    <option v-for="letter in driveLetters" :selected="currentLetter == letter ? true : false">{{letter}}</option>
                </select>
                <div class="button-area">
                    <div class="btn green" v-on:click="save">Save Preferences</div>
                </div>
            </form>
        </div>
    </main>
</template>

<script>
const driveLetters = require('windows-drive-letters');
import Toasted from 'vue-toasted';
let allDriveLetters = driveLetters.usedLettersSync();
let currLetter = '';
if(localStorage.length  !== 0 || typeof localStorage.driveLetter !== 'undefined' || localStorage.driveLetter.length !== 0){
  currLetter = localStorage.driveLetter;
}


export default {
   name: 'preferences',
   data () {
      return {
        driveLetters: allDriveLetters,
        currentLetter: currLetter
      }
    },
     methods: {
          close(){
              console.log(localStorage);
              if(localStorage.driveLetter !== undefined){
                const electron = require('electron')
                const remote = electron.remote;
                console.log(document.getElementById('closeBtn'))
                var window = remote.getCurrentWindow();
                window.close();
              }else{
                  //insert toast
              }
        },
        save(){
            const selectLetter = document.getElementById('drive-letter');
            let selected = selectLetter.options[selectLetter.selectedIndex].value;
            console.log(selected);
            localStorage.setItem('driveLetter', selected);
            console.log(localStorage);
            //insert toast
            this.$toasted.success('Preferences Saved!', {
              icon: 'check',
              position: 'bottom-center',
              duration: 1500
            })
            this.$root.$emit('prefsSaved');
            //Toasted.show('saved');
        }
        
        
     },
     components: {
          Toasted
        }
}
      
    


</script>


<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
form {
  margin: 30px 0;
}
label {
  display: block;
  margin-bottom: 20px;
}
.button-area {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: auto;
  margin-top: 40px;
}
.button-area > div {
  flex-basis: 50%;
}
.btn {
  padding: 10px;
  text-align: center;
  color: #fff;
  cursor: pointer;
}
.btn.green {
  background-color: #42b983;
}
.wrapper {
  padding: 30px 15px;
}
.title {
  font-size: 22px;
}
.close {
  position: absolute;
  right: 15px;
  top: 10px;
  width: 24px;
  height: 24px;
  opacity: 0.3;
  cursor: pointer;
}
.close:hover {
  opacity: 1;
}
.close:before,
.close:after {
  position: absolute;
  left: 15px;
  content: ' ';
  height: 24px;
  width: 2px;
  background-color: #333;
}
.close:before {
  transform: rotate(45deg);
}
.close:after {
  transform: rotate(-45deg);
}
</style>

