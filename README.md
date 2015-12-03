# stress-monkey

This repository contains the implementation for a Stress Monkey service that stress tests specified application endpoints. To operate the service, you must first have a basic web application running preferably exposed with a public IP address on a different server than the stress monkey service to get reliable metrics.  We have provided a sample application inside <code>application/appEndpoint.js</code> file. This application conatainst the following endpoints:
- <IP address>:3000/ = Simple index page endpoint
- <IP address>:3000/mathy = Comuptationally intensive matrix multiplication endpoint
- <IP address>:3000/fileOps = File I/O endpoiont

Targeting the different endpoints essentially tests the application to see how many requests the server can handle in regards to a specific request. This is necessary to confirm the assumption that computationally intensive tasks and File I/O tasks will reach higher latency or errors for responses when throttling begins to occur. Using this method gives developers an approximate threshold for implementing a loadbalancer to distribute traffic to nodes based on the effective stress of a certain request on the system.

We have an example of the loadbalancing functionality in our codebase by routing all traffic initially through a node hosting  <code>application/stressProxy.js</code>. Keeping track of which nodes are servicing which request, we can route traffic to nodes with less stress to ensure the lowest possible latency on responses. However, there is still the possible case that our loadbalancer gets throttled with requests. We handle this misuse case by making our stress proxy also operate as a Decoy Monkey service.

If the Decoy Monkey receives an inordinate amount of requests, it is most likely from a possible DDoS attack.TODO


- [ ] Update README for the description of project
- [ ] Update Proxy Server to have latency check and decoy monkey.
- [ ] Add the graph of requests with more latency than threshold.

