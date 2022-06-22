import Web3 from 'web3';
import { Contract, EventData } from 'web3-eth-contract';
import ensRegistry from './contracts/ensRegistry';
import ensResolver from './contracts/ensResolver';
import fs from 'fs';
import _ from "lodash";
import { Address } from './types/alias';
import ensRegistryController from './contracts/ensRegistryController';

export default class Web3Instance {
  private static instance: Web3Instance;
  private web3: Web3;
  private contracts: Contract[];
  
  
  private constructor() {
    // this.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/213fff28936343858ca9c5115eff1419"));
    this.web3 = new Web3(new Web3.providers.HttpProvider("https://eth-mainnet.alchemyapi.io/v2/hutIF2rq-tQxGMtDqpYIgJjJoPvh7PJS"));
    // this.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/6ac23cd1c67249949ee6666e42d03278"));
    this.contracts = [];
    return this
    /////////////////////////
    // .addContract("0x314159265dd8dbb310642f98f50c066173c1259b", ensRegistry)
    // .addContract("0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", ensRegistry)
    ////////////////////////
    // .addContract("0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", ensRegistryController)
    .addContract("0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5", ensRegistryController);
  }

  public static getInstance(): Web3Instance {
    if (!Web3Instance.instance) {
        Web3Instance.instance = new Web3Instance();
    }

    return Web3Instance.instance;
  }

  addContract(addr: Address, abi: any) {
    this.contracts.push(
      // new this.web3.eth.Contract(ensRegistry as any, addr)
      new this.web3.eth.Contract(ensRegistryController as any, addr)
    );
    return this;
  }  
  // async getPastEvents(start: number = 9380471, step: number = 1000) {
  async getPastEvents(start: number = 9380380, step: number = 1000) {
  // async getPastEvents(start: number = 9380380, step: number = 1000) {
    try {
      const lastblock = await this.web3.eth.getBlockNumber();
      for (const contract of this.contracts) {
        // if (contract.options.address === "0x314159265dD8dbb310642f98f50C066173C1259b") {
          if (contract.options.address === "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5") {
          start = 3327417;
          // start = 5620248;
          console.log("starting with ", start);
        } 
        let events: EventData[] = [];
        let startBlock = start;
        let endBlock:number = startBlock + step;
        let completeStatus = "";
  
        console.log(`Starting with ${contract.options.address} registry contract`)
        while (endBlock <= lastblock) {
          try {
            console.log({startBlock, endBlock});
            // const found = await contract.getPastEvents('NewResolver', {
              const found = await contract.getPastEvents('NameRegistered', {
              fromBlock: startBlock,
              toBlock: endBlock
              // toBlock: 'latest'
            });
            const num = ((startBlock - start) * 100) / (lastblock - start);
            completeStatus = Math.round(num * 100 / 100).toFixed(2);
            console.log(`Progress: ${completeStatus}%\tfetched ${found.length} events`);
            events = events.concat(found);
          } catch (err) {
            console.error(err);
            
            continue ;
          } finally {
            startBlock = endBlock;
            endBlock += step;
          }
        }
        const results = events.map(ev => ({
          // token: ev.returnValues.node,
          // resolver: ev.returnValues.resolver
          name: `${ev.returnValues["name"]}.eth`,
          owner: `${ev.returnValues["owner"]}`
           
          // name: ev.returnValues.name,
          // owner: ev.returnValues.owner
          /////////////////////////////////
          // name: `${ev.returnValues["name"]}`,
          // owner: `${ev.returnValues["owner"]}`,
          // label: `${ev.returnValues["label"]}`,
          // cost: _.toNumber(ev.returnValues["cost"]),
          // expires: _.toNumber(ev.returnValues["expires"]),
          // block: ev.blockNumber,
          // transaction: ev.transactionHash
        }));
        
        // fs.writeFileSync(`results-${contract.options.address}.json`, JSON.stringify(results));
        fs.writeFileSync(`transcation-${contract.options.address}.json`, JSON.stringify(results));
        console.log('done')
      }
    } catch(err) {
      console.error(err);
    }
  }  
}