import http from 'k6/http';
import { check, sleep } from 'k6';

// export let options = {
//     vus: 10,
//     stages: [
//       { duration: "1m", target: 1, rps: 1 },
//       { duration: "2m", target: 10, rps: 10 },
//       { duration: "1m", target: 0, rps: 20 }
//     ]
//   };

export let options = {
  // Specify the output file path
  ext: {
    outputFile: '/test-results/results.json'
  }
};


export default function() {
  let params = {
    jsonrpc: "2.0",
    method: "call",
    id: 1,
    params: {
      db: 'odoo',
      login: 'odoo',
      password: 'odoo'
    }
  };

  let headers = {
    'Content-Type': 'application/json'
  };

  let loginUrl = 'http://odoo-service.default.svc.cluster.local:8069/web/session/authenticate'
  let protectedUrl = 'http://odoo-service.default.svc.cluster.local:8069/web##action=297&model=mrp.production&view_type=list&cids=1&menu_id=151'

  let loginResponse = http.post(loginUrl, JSON.stringify(params), {headers: headers});
  const sessionCookie = loginResponse.cookies.session_id[0].value;

  //console.log(`Session cookie: ${sessionCookie}`);

  let protectedResponse = http.get(protectedUrl, {
    cookies: {
      session: sessionCookie
    }
  });

  check(protectedResponse, {
    'protected resource returned 200': (r) => r.status === 200,
    'html body': (r) => {
        console.log(`Response body: ${r.body.toString()}`);
        return true;
      }
  });

  sleep(1); //let pending requests to complete before exit
}



