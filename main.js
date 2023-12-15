// CLASS COMPONENT
NV.component(

  class Main extends Nirvana {
    
    parser = new DOMParser();
    crystal = NV.store("Crystal");
    crystalType = NV.store("Crystal.type");
    crystalIcon = NV.store("Crystal.icon");
    
    linked = [];
    upgrade = [];
    downgrade = [];
    
    leaderLineOption = {
      dash: true,
      startPlug: "arrow2",
      endPlug: "disc",
      startSocket: 'left', 
      endSocket: 'bottom',
      showEffectName: "draw",
      color: "rgba(0,0,0,0.15)",
      size: 2
    }

    start() {
      window.leaderLine = [];

      this.crystal.forEach(data=> {
        this.select("#crystaNameList").item(0).appendChild( this.node(`
          <option value="${data.get("name")}">${data.get("name").toLowerCase()} (${data.get("type")})</option>
        `));
      });
    }

    search( event ) {
      try {
        const name = this.select("input[name='name']").item(0).value;
        this.searchProcess(name);
      }catch(e) {
        console.log(e);
      }

      event.preventDefault();
    }
    
    searchAgain(name) {
      this.searchProcess(name);
    }

    searchProcess(name) {
      this.select("#output").item(0).innerHTML = '';
        this.findOne(this.crystal, "name", name).then(data=> {

          this.getUpgrade( data.get("code") ).then(()=> {
            this.select("#output-up").item(0).innerHTML = '';
            this.upgrade.forEach(upRow=> {
              let stepBox = '<li class="mb-5">';
              upRow.forEach(crystal=> {
                stepBox += this.card(crystal, true);
              });
              stepBox += '</li>';
              this.select("#output-up").item(0).appendChild(this.node(stepBox));
            });
          });

          if (data.get("link")) {
            this.getDowngrade( data.get("link") ).then(()=> {
              this.select("#output-down").item(0).innerHTML = '';
              this.downgrade.forEach((crystal, i)=> {
                let stepBox = '<li class="mb-5">';
                stepBox += this.card(crystal, true);
                stepBox += '</li>';
                this.select("#output-down").item(0).appendChild(this.node(stepBox));
              });
            });
          }else {
            this.select("#output-down").item(0).innerHTML = '';
          }

          this.select("#output").item(0).appendChild(this.card(data));
          setTimeout(()=> { 
            this.link();
          });
        }).catch(e=> {
          this.select("#output").item(0).innerHTML = '';
          this.select("#output-up").item(0).innerHTML = '';
          this.select("#output-down").item(0).innerHTML = '';
        });
    }

    link() {
      if (window.leaderLine.length!==0) {
        window.leaderLine.forEach(line=> {
          line.remove();
        });
        window.leaderLine = [];
      }
      this.select(".card").forEach(element=> {
        if (this.select(element.getAttribute("link")).item(0)) {
          window.leaderLine.push(new LeaderLine(
            element,
            this.select(element.getAttribute("link")).item(0),
            this.leaderLineOption
          ));
        }
      });
    }

    card(crystal, asString=false) {
      let element = `
      <div id="crystal-${crystal.get("code")}" link="#crystal-${crystal.get("link")}" class="card mb-2">
        <img src="${this.crystalIcon.get(crystal.get("type"))}" alt="icon" width="20px" class="m-1 rounded">
        <div>
          <div class="d-flex align-items-center">
            <h6 class="m-0">${crystal.get("name")}</h6>
            <button onclick="NV.run('Main').searchAgain('${crystal.get("name")}')" class="btn btn-sm">🔎</button>
          </div>
          <small class="text-secondary">${crystal.get("type")}</small>
          <div class="m-0 small">
            ${ crystal.get("view").replaceAll('\n', '<br>') }
          </div>
        </div>
      </div>
      `;
      if (asString) {
        return element;
      }else {
        return this.node(element);
      }
    }


    async getUpgrade( code ) {
      await this.findAll(this.crystal, "link", code).then(upgrade=> {
        if (upgrade.size) {
          upgrade.forEach(data=> {
            this.getUpgrade(data.get("code"));
          });
          this.upgrade.push(upgrade);
        }
      });
    }

    async getDowngrade( link ) {
      await this.findOne(this.crystal, "code", link).then(downgrade=> {
        if (typeof downgrade!=='undefined') {
          this.getDowngrade(downgrade.get("link"));
          this.downgrade.push(downgrade);
        }
      });
    }





    node(string) {
      return this.parser.parseFromString(string, 'text/html').body.firstChild;
    }

    findOne(fromThis, byKey, sameAs) {
      return new Promise((resolve, reject) => {
        let result;
        for (let i=0; i<fromThis.size; i++) {
          if (fromThis.get(i.toString()).get(byKey)==sameAs) {
            result = fromThis.get(i.toString());
          }
        }
        resolve(result);
      });
    }

    findAll(fromThis, byKey, sameAs) {
      return new Promise((resolve, reject) => {
        let result = new Map();
        for (let i=0; i<fromThis.size; i++) {
          if (fromThis.get(i.toString()).get(byKey)==sameAs) {
            result.set(i.toString(), fromThis.get(i.toString()));
          }
        }
        resolve(result);
      });
    }

  }
);

// RUNNER CLASS
NV.run("Main").start();