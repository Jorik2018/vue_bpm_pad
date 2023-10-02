<template>
  <ion-content :scroll-events="true">
    <v-form header="PAD" action="/admin/bpm/run">
      <v-table
        :selectable="true"
        @loaded="tableLoaded"
        row-style-class="row.activity.id?(row.activity.progress>100?'':(row.activity.progress>70?'':'')):'gray'"
        :scrollable="true"
        :pagination="20"
        :filters="filters"
        src="/api/bpm/run"
      >
        <template v-slot:header="">
          <v-button
            value="Crear"
            icon="fa-plus"
            class="on"
            @click.prevent="create"
          ></v-button>
          <!-- <v-button
            value="Editar"
            icon="fa-pen"
            @click.prevent="edit"
            :disabled="!rowSelectedCount"
          ></v-button> -->
          <v-button
            value="Atender"
            v-if="1 || can(perms.DESARROLLO_SOCIAL_REGISTER_SIVICO)"
            icon="fa-pen"
            @click.prevent="attend"
            :disabled="!rowSelectedCount"
          ></v-button>
          <v-button
            value="Ver"
            icon="fa-search"
            @click.prevent="view(getSelected()[0])"
            :disabled="!rowSelectedCount"
          ></v-button>
          <v-button
            value="Eliminar"
            v-if="1 || can(perms.DESARROLLO_SOCIAL_REGISTER_SIVICO)"
            icon="fa-trash"
            @click.prevent="destroy"
            :disabled="!rowSelectedCount"
          ></v-button>
          <v-button
            value="Reporte"
            icon="fa-download"
            @click.prevent="download"
            :disabled="!rowSelectedCount"
          ></v-button>
          <v-button
            title="Refrescar"
            icon="fa-sync"
            @click.prevent="refresh"
          ></v-button>
        </template>
        <template v-slot="{ row, index }">
          <td width="60" class="center" header="Año">
            <v-filter>
              <v-number v-model="filters.year" />
            </v-filter>
            {{ row.caso_anio }}
          </td>
          <td width="80" class="center" header="Numero">
            <v-filter>
              <v-number v-model="filters.number" />
            </v-filter>
            {{ row.caso_numero }}
          </td>
          <td width="220" header="Asunto">
            <v-filter>
              <input v-model="filters.subject" />
            </v-filter>
            {{ row.caso_asunto }}
          </td>
          <td width="220" header="Infractor">
            <v-filter>
              <input v-model="filters.offender" />
            </v-filter>
            {{ row.caso_infractor }}
            <br />
            <p style="text-transform: uppercase">
              {{ row.caso_infractor_position }}
            </p>
          </td>
          <td width="40" class="center" header="">
            <div
              :key="index + '_' + k"
              class="circle"
              :style="{
                border: '1px solid black',
                width: 30,
                height: 30,
                backgroundColor: row.activity
                  ? row.activity.id
                    ? row.activity.progress > 100
                      ? 'red'
                      : getColor(row.activity)
                    : 'gray'
                  : '',
              }"
            ></div>
          </td>

          <td width="220" header="Actividad">
            <template v-if="row.activity">
              <div :title="row.activity"></div>
              {{ row.activity ? row.activity.description : "" }}
              <br />
              {{ app.tt(row.activity) }}
            </template>
          </td>

          <td width="180" header="Delegado a">
            <template v-if="row">
              {{ row.delegatedUser }}
            </template>
          </td>
          <td width="90" class="center" header="Creado">
            <v-filter>
              <input v-model="filters.province" />
            </v-filter>
            <template v-if="row.dispatch">
              {{ row.dispatch.insertDate | formatDate }}
            </template>
          </td>
        </template>
      </v-table>
    </v-form>
  </ion-content>
</template>
<script>
var _ = window._;
export default _.ui({
  data() {
    return {
      k: 0,
      rowSelectedCount2: 0,
      page: 0,
      data: [],
      mode: 0,
      query: null,
    };
  },

  created() {
    this.filters.uid = this.user.uid;
    this.$on("sync", function (dr, dl) {
      //data remote -> data local
      if (dr.people && dl.people) {
        dr.people.forEach((pr) => {
          dl.people.forEach((pl) => {
            if (pl.tmpId == pr.tmpId) {
              if (pr.id) {
                pl.id = pr.id;
                pl.tmpSynchronized = 1;
              }
              if (pr.encuesta_id) {
                pl.encuesta_id = pr.encuesta_id;
                pl.parent = pr.encuesta_id;
              }
              console.log(pl);
            }
          });
        });
      }
    });
  },
  updated() {
    window.app.bindLinks(this.$el);
  },
  methods: {
    getColor(o) {
      return o.color;
    },
    tableLoaded(e) {
      e.target.data.forEach((e) => {
        if (e.activity) this.app.tt(e.activity);
        if (e.ext){
          Object.keys(e.ext).forEach((key) => {
            e[key]=e.ext[key];
          });
          if(e.ext.all){
            const w=e.ext.all;
            w.split("|,").forEach((e2) => {
              e2 = e2.split("=");
              if (e[e2[0]]) {
                e[e2[0]] += ", " + e2[1];
              } else e[e2[0]] = e2[1];
            });
          }
        }
      });
      this.k++;
    },
    attend(e) {
      this.edit(e);
    },
    rss(e) {
      e = e.selection;
      this.rowSelectedCount2 = e ? e.length : 0;
    },
    can(o) {
      var m = this,
        u = m.user;
      return o || u.uid == 1;
      /*return u.uid == 1 || p.REGISTER_DESARROLLO_SOCIAL_SIVICO &&
            !o || o.user == u.id;*/
    },
    view(o) {
      this.open("/admin/bpm/run/" + (o.tmpId ? -o.tmpId : o.id));
    },
    toInt(o) {
      return Array.isArray(o) ? o.length : o;
    },
    download() {
      this.app.download(this.getSelected()[0]);
    },
  },
});
</script>
<style scoped>
.hg {
  background-color: green !important;
}
.hgd {
  background-color: #005d00 !important;
}
.hr {
  background-color: #bf0000 !important;
}
.hbd {
  background-color: #033d71 !important;
}
</style>
