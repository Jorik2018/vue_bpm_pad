<template>
  <v-form
    action="/admin/desarrollo-social/api/sivico"
    :title="o.synchronized"
    header="Ver PAD"
    store="pool"
  >
    <div class="v-form">
      <v-fieldset v-if="o.ext.details" legend="Ruta del Proceso">
        <v-table
          v-bind:value="o.ext.details"
          :key="k"
          @row-select="selected = $event.current"
          row-style-class="(row[0]&&!row[0].attentionDate)?(row[1]&&row[1].progress>100?'red':'yellow'):''"
          selectable="false"
        >
          <template v-slot:default="{ row }">
            <td class="center" header="Fecha" width="80">
              <template v-if="row[0]">
                {{ row[0].insertDate | formatDate }}
              </template>
            </td>
            <td header="Actividad">
              <template v-if="row[1]">
                {{ row[1].description ? row[1].description : row[1] }}
                <div v-if="row[1].description">
                  {{ app.tt(row[1]) }}
                  {{ row[1].color }}
                </div>
              </template>
              <div v-if="row[4]&&row[4].length" class="details">
                <div v-for="(item, i) in row[4]" v-bind:key="i">
                  <label>{{ item.label }}</label>
                  <div v-if="item.type == 'F'">
                    <a
                      target="blank"
                      style="line-break: anywhere"
                      :href="
                        'http://web.regionancash.gob.pe/fs/bpm/' + item.value
                      "
                    >
                      {{ item.value }}
                    </a>
                  </div>
                  <ol v-else-if="item.type == 'X'">
                    <li v-for="(v, k) in item.value" :key="k">
                      <b>{{ v.code }}: {{ v.fullName }} {{ v.position }}</b
                      >, {{ v.address }}
                    </li>
                  </ol>
                  <div v-else>
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </td>

            <td header="Dependencia">
              {{ row[3] }}
            </td>
            <td class="center" header="Atención" width="80">
              <template v-if="row[0]">
                {{ row[0].attentionDate | formatDate }}
              </template>
            </td>
            <td header="Usuario">{{ row[2] }}</td>
            <td header="Comentario" class="center" width="80">
              <template v-if="row[0]">
                {{ row[0].comments }}
              </template>
            </td>
          </template>
        </v-table>
      </v-fieldset>
    </div>
    <center style="margin-bottom: 10px">
      <v-button
        value="Descargar"
        icon="fa-download"
        class="blue"
        @click.prevent="download"
      ></v-button>
      <v-button
        value="Atender"
        v-if="manageable"
        style="margin-left: 10px"
        icon="fa-paper-plane"
        class="blue"
        @click.prevent="$router.replace('/admin/bpm/run/' + id + '/edit')"
      ></v-button>
      <v-button
        value="Editar"
        class="vv red"
        style="margin-left: 10px"
        icon="fa-pen"
        :disabled="!(selected && selected[0].attentionDate)"
        @click.prevent="open('/admin/bpm/run/dispatch/' + selected[0].id)"
      ></v-button>
    </center>
  </v-form>
</template>
<script>
var axios = window.axios;
var _ = window._;
export default _.ui({
  props: ["id"],
  watch: {
    $route() {
      this.render();
    },
  },
  computed: {
    manageable() {
      var details = this.o.ext.details;
      return !(details.length && details[details.length - 1][0].attentionDate);
    },
  },
  created() {
    var me = this;
    me.$on("destroyed", (o) => {
      console.log(o);
    });
  },
  data() {
    return {
      k: 0,
      selected: null,
      o: { synchronized: null, ext: { details: [] } },
    };
  },
  methods: {
    close() {},
    loadTables() {
      var refs = this.$refs;
      refs.people.load();
      refs.agreement.load();
    },
    render() {
      var me = this,
        id = me.id;
      if (Number(id)) {
        me.filters.masterId = me.id;
        axios.get("/api/bpm/details/" + id).then(response => {
          const d = response.data;
          d.forEach((e) => {
            if (e[4]) {
              const o = [];
              e[4].forEach((e) => {
                const {type,name,label,value} = e;
                if(value){
                  if (name == "dni_infractor") {
                    o.push({type:'X', name:'offenders',label: 'Infractores', value});
                  } else {
                    o.push({type, name, label, value});
                  }
                }
              });
              e[4] = o;
            }
          });
          me.o.ext.details = d;
          me.k++;
        });
      }
    },
    process(o) {
      var user = this.user;
      if (user) o.user = user.id;
      return o;
    },
    download() {
      var me = this,
        o = JSON.clone(this.o);
      o.ext.details[0][4].forEach((e) => (o[e.name] = e.value));
      console.log(o);
      me.app.download(o);
    },
  },
  mounted() {
    var me = this;

    if (this.$children[0]) window.app.title = this.$children[0].header;
    me.render();
  },
});
</script>
<style scoped>
#dateDiff:empty,
#msg:empty {
  display: none;
}
@media (max-width: 700px) {
  /deep/ .vv > span {
    display: none !important;
  }
  /deep/ .vv.v-button-text-icon-left svg {
    margin-right: 0px;
  }
}
#dateDiff {
  border-radius: 4px;
  background-color: #fdfad9;
  border: 1px solid #dddddd;
  padding: 5px 10px;
  margin-top: 10px;
}
tr:not(.v-selected) .details {
  background-color: #e5f1fb;
}
.details {
  border: 1px solid #c1bebe;
  padding: 5px;
}
</style>
