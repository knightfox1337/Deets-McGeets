<template>
  <div id="wrapper" v-bind:class="{validsettings: validSettings}">
    <main>


      <div class="search-area">
        <basic-select :options="files" :selected-option="item" placeholder="select Project" @select="onSelect" :isDisabled="!validSettings"></basic-select>
      </div>
        <div class="button-area">
          <div class="btn blue" v-bind:class="{ active:hasFile }" v-on:click="openPath">Open File Location</div>
          <div class="btn green" v-bind:class="{ active:hasFile }" v-on:click="openFile">Open Details File</div>
        </div>
      
    </main>
    <modal name="drive-letter">
      <div class="wrapper-two">
       <div class="title">Preferences</div>
            <form>
                <label for="drive-letter">Drive letter associated with Jungle Disk</label>
                <select name="drive-letter" id="drive-letter">
                  <option></option>
                    <option v-for="letter in driveLetters" :selected="currentLetter == letter ? true : false">{{letter}}</option>
                </select>
                <div class="button-area">
                    <div class="btn green" v-on:click="save">Save Preferences</div>
                </div>
            </form>
            </div>
    </modal>
  </div>

  

</template>

<script>
  import Vue from 'vue';
  import SystemInformation from './LandingPage/SystemInformation'
  import Toasted from 'vue-toasted';
  import { BasicSelect } from 'vue-search-select'
  import VModal from 'vue-js-modal'
  const driveLetters = require('windows-drive-letters');
  let allDriveLetters = driveLetters.usedLettersSync();
  let currLetter = '';
  if(localStorage.getItem("driveLetter") !== null){
    currLetter = localStorage.driveLetter;
  }
  Vue.use(VModal);
  
  const {shell} = require('electron')
  let readdirp = require('readdirp');
  const fs = require('fs');
  let that;

  let validsettings;
  let directory = 'J:/';
  const testFolder = 'Current/';
  const searchFileName = 'details.txt';
  let allFiles;
  function scanForFiles() {
    let localFileDirector;

    function singleRowTest(items) {
      //console.log(item.parentDir);

      //setting up file structure
      console.log({items});
      for(var i = 0;i < items.length;i++){
        items[i].text = items[i].parentDir;
        items[i].value = items[i].fullPath;
        items[i].lastOpened = 0;
      }

      localStorage.setItem('files', JSON.stringify(items));


      Vue.toasted.clear();
      Vue.toasted.success(items.length + ' Files stored!', {
        icon: 'done',
        position: 'bottom-right',
        action: {
          text: 'Okay',
          onClick: (e, toastObj) => {
            toastObj.goAway(0);
          }
        }
      });
      that.files = items;
      that.validSettings = true;


    }
    function getAllRecords() {
      var tempRecords = [];
      for (var i = 0; i < localStorage.length; i++) {
        //console.log(localStorage.key(i));
        let data = JSON.parse(localStorage.getItem(localStorage.key(i)));
        tempRecords.push({
          text: localStorage.key(i),
          value: data.fullPath,
          data: data,
          location: data.fullParentDir
        });
      }
      return tempRecords;
    }

    function readDir() {
      console.log('Starting to read')
      console.time('readDir');

      //getting Drive letter
      console.log({localStorage});
      if(localStorage.getItem('driveLetter') === null){
        that.showDrive();
        that.validSettings = false;
        Vue.toasted.clear();
        Vue.toasted.error('Drive Letter not set.', {
          position: 'bottom-right',
          action: {
          text: 'Try Again',
          onClick: (e, toastObj) => {
            toastObj.goAway(0);
            that.init();
          }
        }
        });
        return;
      }else{
        directory = localStorage.driveLetter + ':/';
      }


        let returnedItems = [];
        var settings = {
          root: directory + testFolder,
          entryType: 'files',
          // Filter files with js and json extension
          fileFilter: ['details.txt'],
          // Filter by directory
          directoryFilter: [
            '!wp-content',
            '!wp-admin',
            '!wp-includes',
            '!wp-docs',
            '!node_modules',
            '!.git'
          ],
          // Work with files up to 1 subdirectory deep
          depth: 2
        };
        readdirp(
          settings,
          // This callback is executed everytime a file or directory is found inside the providen path
          function(fileInfo) {
            // Store the fullPath of the file/directory in our custom array
            console.log(fileInfo);
            returnedItems.push(fileInfo);
            //singleRowTest(fileInfo);
            //allFilePaths.push(fileInfo.fullPath);
          },

          function(err, res) {
            if (err) {
              console.log(err);
              that.validSettings = false;
              Vue.toasted.clear();
              that.showDrive();
              Vue.toasted.error('Error reading files, ' + err[0].message, {
                icon: 'error_outline',
                position: 'bottom-right'
               
              });

              throw err;
            }

            
            
            singleRowTest(returnedItems);
            


            //this.files = allFiles;
            //console.log({ allFiles });
          }
        );
      
    }

    
     if (localStorage.getItem('files') === null || localStorage.files.length === 0) {
        Vue.toasted.show('loading Files...', {
              icon: 'hourglass_empty',
              position: 'bottom-right'
            })
      readDir();
      
       
    } else {
      
      that.files = JSON.parse(localStorage.files);
      that.validSettings = true;
      //console.log({ allFiles });
      Vue.toasted.success('Ready', {
              duration: 5000,
              icon: 'done',
              position: 'bottom-right'
            })
    }

    
  }
  

 

  // this.$on('prefs-saved', function(){
  //   //Do we need to check for files?

  //   init();
  // })


 export default {
  name: 'landing-page',
  data () {
    return {
      validSettings: false,
      files: allFiles,
      driveLetters: allDriveLetters,
      currentLetter: currLetter,
      searchText: '', // If value is falsy, reset searchText & searchItem
      hasFile: false,
      item: {
        value: '',
        text: ''
      }      
    }
  },
  methods: {
    openPath(){
      if(this.hasFile){
        console.log('open Path', this.item)
        shell.openItem(this.item.fullParentDir);
      }
    },
    openFile(){
      if(this.hasFile){
        console.log('open File')
        shell.openItem(this.item.value);
      }   
    },
    onSelect (item) {
      this.item = item
      this.hasFile = true;
          //shell.openItem(item.value);
    },
    reset () {
      this.item = {}
      this.hasFile = false;
    },
    selectOption () {
      // select option from parent component

      this.item = this.options[0]

    },
    showDrive () {
      this.$modal.show('drive-letter',{
        title: 'Settings',
        driveLetters: that.driveLetters,
        buttons: [
          {
            title: 'Save'
          }
        ]
      });
    },
    hideDrive () {
      this.$modal.hide('drive-letter');
    },
    save(){
      const selectLetter = document.getElementById('drive-letter');
            let selected = selectLetter.options[selectLetter.selectedIndex].value;
            console.log(selected);
            if(selected !== ""){
              localStorage.setItem('driveLetter', selected);
              console.log(localStorage);
              Vue.toasted.clear();
              this.$toasted.success('Preferences Saved!', {
                icon: 'check',
                position: 'bottom-right',
                duration: 1500
              })
              this.$modal.hide('drive-letter');
              that.init();
              
            }else{
              this.$toasted.error('No Drive selected', {
                
                position: 'bottom-right',
                duration: 1500
              })
            }
           



      
    },
    prefsSaved(){
      
    },
    init(){
      scanForFiles();
    }
  },
  mounted: function(){
    that = this;
    this.init();
  },
  created: function(){
    this.$on('prefSaved', () =>{
      console.log('PREFF!!!')
    })
  },
  Events: {
    'prefSaved': function(){
      console.log('HELLOAAA');
    }
  },
  components: {
    BasicSelect,
    Toasted
  }
}
  




  
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

@keyframes spin {
  5% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.toasted.primary .material-icons {
  -webkit-animation: spin 2s linear infinite;
  -moz-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}
.toasted.success .material-icons,
.toasted.error .material-icons {
  -webkit-animation: none;
  -moz-animation: none;
  animation: none;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.ui.fluid.dropdown {
  min-width: 60%;
  max-width: 60%;
  margin: auto;
}
body {
  font-family: 'Source Sans Pro', sans-serif;
}

#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  margin-bottom: 6px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  /* display: flex;
  justify-content: space-between; */
}

main > div {
  /* flex-basis: 50%; */
}
.button-area {
  display: flex;
  justify-content: space-between;
  width: 60%;
  margin: auto;
  margin-top: 40px;
}
.button-area > div {
  flex-basis: 45%;
}
.btn {
  padding: 10px;
  text-align: center;
  color: #fff;
  cursor: not-allowed;
}
.btn.blue {
  background-color: #2c3e50;
}
.btn.green {
  background-color: #42b983;
}
.btn.active {
  cursor: pointer;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc button {
  font-size: 0.8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
}

.doc button.alt {
  color: #42b983;
  background-color: transparent;
}
form {
  margin: 30px 0;
}
label {
  display: block;
  margin-bottom: 20px;
}
.wrapper-two {
  padding: 30px 70px;
}
.title {
  font-size: 22px;
}
form .button-area > div {
  flex-basis: 100%;
}
form .btn {
  cursor: pointer;
}
</style>
