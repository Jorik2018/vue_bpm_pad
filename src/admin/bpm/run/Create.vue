<template>
  <v-form
    action="/api/bpm/run"
    :header="(dispatch ? 'Editar' : o.id ? 'Atender' : 'Crear') + ' PAD'"
    :class="
      o.id < 0 || (o.tmpId && !o.synchronized)
        ? 'yellow'
        : o.tmpId
        ? 'green'
        : ''
    "
    store="pool"
  >
    <div class="v-form" v-if="o.activity">
      <v-fieldset legend="Actividad a confirmar">
        <div :title="o.activity.id" v-if="o.activity">
          {{ o.activity.description }}
        </div>
      </v-fieldset>

      <div v-if="o.activity.fields && o.activity.fields.length" class="v-form">
        <template v-for="(item, i) in o.activity.fields">
          <div :key="'div-' + i">
            <template v-if="[20, 28, 46].contains(item.id)">
              <template v-if="item.id == 20">
                <v-fieldset legend="Infractores">
                  <label>Documento Identidad:</label>
                  <input v-model="o.ext.value" />
                  <div class="right" style="margin-top: 10px">
                    <v-button
                      :disabled="!(o.ext.value && o.ext.value.length > 6)"
                      icon="fa-search"
                      @click="
                        buscarReniec(o.ext.value, (e) => {
                          addPeople({
                            code: o.ext.value,
                            fullName: e.fullName,
                            address: e.address,
                          });
                          delete o.ext.value;
                        })
                      "
                      value="RENIEC"
                    />
                  </div>
                  <label>Nombre Completo:</label>
                  <input v-model="o.ext.fullName" />

                  <label>Cargo Desempeñado:</label>
                  <input v-model="o.ext.position" />

                  <div class="right" style="margin-top: 10px">
                    <v-button
                      :disabled="!o.ext.fullName || !o.ext.position"
                      icon="fa-search"
                      @click="
                        addPeople({
                          code: o.ext.value,
                          fullName: o.ext.fullName,
                          position: o.ext.position,
                        });
                        o.ext.value = null;
                        o.ext.fullName = null;
                      "
                      value="Agregar Persona"
                    />
                  </div>
                  <table
                    v-if="o.peoples.filter((e) => !e.delete).length"
                    class="v-table"
                    style="margin-top: 10px"
                    width="100%"
                  >
                    <thead>
                      <tr>
                        <th width="80" class="center">DNI</th>
                        <th>Nombre Completo</th>
                        <th>Cargo Desempeñado</th>
                      </tr>
                    </thead>
                    <template
                      v-for="(people, k) in o.peoples.filter((e) => !e.delete)"
                    >
                      <tr :key="k">
                        <td class="center">{{ people.code }}</td>
                        <td>
                          {{ people.fullName }}{{ people.delete }}
                          <div
                            style="float: right; margin: 5px; display: inline"
                            @click="people.delete = 1"
                          >
                            <i class="fa fa-times"></i>
                          </div>
                        </td>
                        <td>
                          {{ people.position }}{{ people.delete }}
                          <div
                            style="float: right; margin: 5px; display: inline"
                            @click="people.delete = 1"
                          >
                            <i class="fa fa-times"></i>
                          </div>
                        </td>
                      </tr>
                      <tr :key="k + 'address'">
                        <td colspan="2">
                          <v-textarea
                            v-model="people.address"
                            maxlength="200"
                          />
                        </td>
                      </tr>
                    </template>
                  </table>
                </v-fieldset>
              </template>
            </template>
            <template v-else>
              <label>{{ item.label }}:</label>
              <div v-if="item.type == 'F'">
                <!-- <input
                  style="
                    color: black;
                    padding: 5px !important;
                    border: 1px solid lightgrey !important;
                    margin-bottom: 10px;
                  "
                  :style="{
                    backgroundColor:
                      item.required && !item.value ? 'linen !important' : '',
                  }"
                  :required="item.required && !item.value"
                  readonly="readonly"
                  :value="item.value ? item.value.fileName : ''"
                />
                <div class="right">
                  <a
                    v-if="item.value"
                    :href="
                      'http://web.regionancash.gob.pe' +
                      (item.value.tempFile
                        ? '/fs/temp/' + item.value.tempFile
                        : '/fs/bpm/' + item.value)
                    "
                    style="float: left"
                    target="blank"
                  >
                    Descargar <i class="fa fa-download"></i
                  ></a>
                  <v-uploader icon="fa-upload" @input="item.value = $event" />
                </div> -->
              </div>
              <v-radio-group
                required="required"
                :name="item.name"
                v-if="item.type == 'R'"
                v-model="item.value"
              >
                <v-radio
                  v-for="(option, j) in item.description.split(',')"
                  :key="'r-' + j"
                  v-bind:label="option | capitalize"
                  :value="option"
                />
              </v-radio-group>
              <v-calendar
                v-if="item.type == 'D'"
                required="required"
                v-model="item.value"
              />
              <v-calendar
                v-if="item.type == 'TI'"
                type="time"
                required="required"
                v-model="item.value"
              />
              <input
                v-if="item.type == 'T'"
                maxlength="200"
                required="required"
                type="text"
                v-model="item.value"
              />

              <input
                v-if="item.type == 'N'"
                required="required"
                type="number"
                style="text-align: left"
                v-model="item.value"
              />
              <v-textarea
                v-if="item.type == 'TA'"
                required="required"
                v-model="item.value"
              />
              <template
                v-else-if="item.type == 'C' && item.name == 'delegatedUserId'"
              >
                <v-select v-model="item.value" required="required">
                  <option>--Seleccionar Opcion--</option>
                  <v-options
                    src="/api/bpm/user"
                    displayField="name"
                    valueField="uid"
                  />
                </v-select>
              </template>
              <component
                v-else-if="item.type == 'C'"
                :is="componentType(item)"
                :proyect="o"
                :title="JSON.stringify(item)"
                v-model="item.value"
              ></component>
            </template>
          </div>
        </template>
      </div>
      <div class="v-form" v-if="o.dispatch">
        <label>Comentarios:</label>
        <v-textarea v-model="o.dispatch.comments" />
      </div>
    </div>
    <center>
      <v-button
        value="Grabar"
        icon="fa-save"
        class="blue"
        @click.prevent="save"
      ></v-button>
      <v-button
        style="margin-left: 10px"
        value="Ver"
        :disabled="!o.id"
        icon="fa-eye"
        class="blue"
        @click.prevent="
          $router.replace('/admin/bpm/run/' + (o.tmpId ? -o.tmpId : o.id))
        "
      ></v-button>
    </center>
  </v-form>
</template>
<script>
import "ol/ol.css";
var axios = window.axios;
var _ = window._;
export default _.ui({
  props: ["id", "dispatch"],
  data() {
    return {
      count: 0,
      red: [],
      key2: 0,
      areaResidencia: [
        { id: "U", name: "URBANO" },
        { id: "M", name: "URBANO MARGINAL" },
        { id: "R", name: "RURAL" },
      ],
      resultadoVisita: ["EJECUTADO", "RECHAZADO", "ABANDONADO"],
      trayLocation: null,
      o: {
        id: null,
        activity: {},
        synchronized: null,
        fields: [],

        lat: null,
        tmpId: null,
        lon: null,
        red: null,
        microred: null,
        ext: { src: null },
        agreements: [],
        peoples: [],
      },
    };
  },
  mounted() {
    var me = this;
    me.changeRoute();
  },
  methods: {
    buscarReniec(n, e) {
      var me = this;
      axios
        .post("https://web.regionancash.gob.pe/api/reniec/", { dni: n })
        .then((r) => {
          var p = r.data;
          if (p.consultarResponse.return.coResultado == "0000") {
            p = p.consultarResponse.return.datosPersona;
            e({
              fullName: p.apPrimer + " " + p.apSegundo + " " + p.prenombres,
              address: p.direccion + " - " + p.ubigeo,
              delete: null,
            });
          } else {
            me.MsgBox(p.deResultado);
          }
        });
    },
    addPeople(p) {
      var me = this,
        peoples = me.o.peoples;
      peoples.push(p);
      // if (peoples.filter((e) => e.code == p.code).length)
      //   me.MsgBox(p.fullName + " ya esta incluido en el expediente!");
      // else peoples.push(p);
    },
    process(o) {
      console.log(o);
      return o;
    },
    log(o) {
      console.log(o);
    },
    changeRoute() {
      var me = this;
      if (me.dispatch) {
        axios.get("/api/bpm/dispatch/" + me.dispatch).then(function (response) {
          var o = response.data,
            peoples = [],
            fields = [],
            added = false,
            i = 0;
          o.activity.fields.forEach((e) => {
            if (e.type == "D" && e.value) {
              const [year, month, day] = e.value.split("-");
              e.value = new Date(+year, +month - 1, +day).getTime();
            }
            if (e.name == "dni_infractor") {
              if (e.dispatchFieldId)
                peoples.push({
                  id: e.dispatchFieldId,
                  code: e.value,
                  delete: null,
                });
            } else if (e.name == "caso_infractor") {
              if (e.dispatchFieldId) {
                peoples[i].nid = e.dispatchFieldId;
                peoples[i].fullName = e.value;
              }

              if (!added) {
                delete e.value;
                fields.push(e);
                added = 1;
              }
              i++;
            } else if (e.name == "domicilio_infractor") {
              if (e.dispatchFieldId) {
                peoples[i - peoples.length].aid = e.dispatchFieldId;
                peoples[i - peoples.length].address = e.value;
              }
              i++;
            } else 
              fields.push(e);
          });
          o.ext = {};
          o.peoples = peoples;
          console.log(peoples);
          console.log(fields);
          o.activity.fields = fields;
          me.o = o;
          me.key2++;
        });
      } else if (me.id) {
        axios.get("/api/bpm/run/" + me.id).then(function (response) {
          var o = response.data;
          o.activity.fields.forEach((e) => {
            e.value = "";
          });
          o.ext = {};
          o.peoples = [];
          me.o = o;
          me.key2++;
        });
      } else
        axios.get("/api/bpm/prepare/1").then(function (response) {
          var o = response.data;
          o.activity.fields.forEach((e) => {
            if (e.id === 18) {
              e.value = "2023";
            } else {
              e.value = "";
            }
          });
          o.ext = {};
          o.peoples = [];
          me.o = o;
          me.key2++;
        });
    },
    close() {
      var me = this;
      me.$router.replace("/admin/bpm/run");
    },
  },
});
</script>
