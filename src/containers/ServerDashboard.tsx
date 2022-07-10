import React, {useEffect, useState} from "react";
import {Authenticator} from "@aws-amplify/ui-react";
import {IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@material-ui/core";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import {API} from "aws-amplify";
import {green, grey, red} from "@material-ui/core/colors";


interface Server {
  readonly instance_id: string;
  readonly state: string;
  readonly public_dns_name: string;
  readonly public_ip_address: string;
  readonly is_minecraft_running: boolean;
  readonly is_bedrock_running: boolean;
  is_disabled: boolean;
}

function ServerDashboard() {
  const [servers, setServers] = useState<Server[]>([]);
  const [response, setResponse] = useState();

  const getStatus = () => {
    console.log("Updating server status");
    const params = {
      queryStringParameters: {},
    }

    API
      .get('MemersonApi', 'server_status', params)
      .then(response => {
        setServers(response.servers.map((obj: any) => ({ ...obj, is_disabled: false })));
      })
      .catch(error => {
        console.error(error.response);
      });
  }

  const controlInstance = (action: string, instanceId: string, index: number) => {
    let newServers: Server[] = [...servers];
    newServers[index].is_disabled = true;
    setServers(newServers);
    const params = {
      queryStringParameters: {
        action: action,
        instance_id: instanceId
      },
    }

    API
      .get('MemersonApi', 'server_control', params)
      .then(response => {
        setResponse(response);
        // TODO: improve refreshing data, re-enable buttons after instance has started or stopped
        for (let i = 5000; i <= 35000; i += 10000) {
          setTimeout(getStatus, i);
        }
      })
      .catch(error => {
        console.error(error.response);
      });
  }

  useEffect(() => {
    getStatus();
  }, []);

  const textStyle = {
    marginLeft: '10px',
    marginTop: '10px'
  }

  return (
    <Authenticator>
      {({signOut, user}) => (
        <div style={textStyle}>
          {servers &&
              <Table>
                  <TableHead>
                      <TableRow>
                          <TableCell>Instance Id</TableCell>
                          <TableCell>State</TableCell>
                          <TableCell>DNS Name</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>Minecraft</TableCell>
                          <TableCell>Actions</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                    {servers.map((server: Server, index: number) => (
                      <TableRow key={server.instance_id}>
                        <TableCell>{server.instance_id}</TableCell>
                        <TableCell style={server.state === 'running' ? { color: green[500] } : { color: red[500] } }>
                          {server.state}
                        </TableCell>
                        <TableCell>{server.public_dns_name}</TableCell>
                        <TableCell>{server.public_ip_address}</TableCell>
                        <TableCell style={server.is_minecraft_running ? { color: green[500] } : { color: red[500] } }>
                          {server.is_minecraft_running ? 'Online' : 'Offline'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="start server"
                            style={{ color: server.is_disabled || server.state !== "stopped" ? grey[500] : green[500] }}
                            disabled={server.is_disabled || server.state !== "stopped"}
                            onClick={() => controlInstance("start", server.instance_id, index)}
                          >
                            <PlayArrowIcon/>
                          </IconButton>
                          <IconButton
                            aria-label="stop server"
                            style={{ color: server.is_disabled || server.state !== "running" ? grey[500] : red[500] }}
                            disabled={server.is_disabled || server.state !== "running"}
                            onClick={() => controlInstance("stop", server.instance_id, index)}
                          >
                            <StopIcon/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
              </Table>
          }
          {response &&
              <>
                  <Typography variant="h3">Response</Typography>
                  <pre>{JSON.stringify(response)}</pre>
              </>
          }
        </div>
      )}
    </Authenticator>
  );
}

export default ServerDashboard;
