### Connex Entities

Connex entity contracts allows mapping of contract entities and uses a middleware (Vue plugin) to connect
to Comet and Connex.

### Middleware

### Vue 

`npm i -S @decent-bet/vue-connex-entities`

More info: `https://github.com/decent-bet/vue-connex-entities`

#### Adding Contract Entities to plugin middleware
```typescript
Vue.use(ConnexEntityContract, {
    entities: [
      { name: 'Energy', contract: EnergyTokenContract }, 
      { name: 'DBET', contract: DBETVETTokenContract }
    ]
});
```

#### Requesting Connex and Comet
When required, request access to the external wallet and middleware will create the contract entities in the Vue instance variable `$contractEntities`.

The following instance variables are available:

* `$requestExternalWalletAccess`: Request access to external wallet
* `$contractEntities`: The contract entities created after external wallet access sucess.

```typescript
  async loginComet() {
    await this.$requestExternalWalletAccess();
    const myAccount = this.$contractEntities.Energy.defaultAccount;
    const vthoBalance = await this.$contractEntities.Energy.balanceOf(myAccount);
  }
```

#### Contract Import
```typescript
const EnergyTokenContractAbi = require('./Energy');

const EnergyContractImport: ContractImport = {
  raw: {
    abi: EnergyTokenContractAbi.abi
  },
  address: {
    '0x27': '0x0000000000000000000000000000456E65726779',
    '0x4a': '0x0000000000000000000000000000456E65726779'
  }
};

```

### API

#### @ConnexContract
A contract entity maps to a contract import using the `@ConnexContract`, which has an `IConnexContract` interface and `OnConnexReady` mixin.

```typescript

@ConnexContract({
  import: EnergyContractImport
})
export class EnergyTokenContract {
  constructor() {
    super();
  }
}
```

#### IConnexContract properties

* connex
* chainTag
* defaultAccount

#### OnConnexReady events

* onConnexReady(connex, chainTag, defaultAccount)

In most cases the base class will handle the basic scenario where a vendor wallet sets the connex and other properties.

#### Contract Methods
##### @GetMethod

Returns a `Connex.Thor.Method` instance.
```typescript
  @GetMethod({
    nameOrAbi: 'balanceOf',
    address: () => EnergyContractImport.address[ConnexService.chainTag]
  })
  public balanceOfMethod(): any {}
```

##### @Read

Returns a Promise with the result of the VMOutput call execution.
```typescript
  @Read({
    nameOrAbi: 'balanceOf',
    returns: 'decoded',
    address: () => EnergyContractImport.address[ConnexService.chainTag]
  })
  public balanceOf(address: string): any {}
```

or

```typescript
  @Read()
  public balanceOf(address: string): any {}
```

##### @Write

Returns a Promise with the result of a signing execution.
```typescript
  @Write({
    nameOrAbi: 'transfer',
    gas: 90_000
  })
  public transferMethod(address: string, wei: BigNumber): any {}
```

##### @MultiClauseWrite

```typescript
  @MultiClauseWrite({
    nameOrAbi: 'transfer',
    gas: 90_000
  })
  public transferMethod(address: string, wei: BigNumber, world: BigNumber): any {
    return (m: Connex.Thor.Method) => {
      return [{
        comment: 'Hello',
        ...m.asClause(address, wei)
      },{
        comment: 'World',
        ...m.asClause(world)
      }];
    }
  }
```

##### Using validations

Returns an error if a validation fails, otherwise continues with call execution.
```typescript
  @Write({
    nameOrAbi: 'transfer',
    gas: 90_000,
    validations: {
      address: 'address',
      wei: 'bignumber'
    }
  })
  public transferMethod(address: string, wei: BigNumber): any {}
```


#### Contract Events
##### @AccountEventFilter

A contract event filter, it can run once or by polling. A thunk function  is required which gets a Filter instance. Returns an Observable if interval is used, else a Promise.

```typescript
  const topics = ConnexTopic.address('0x')
  .or(
    ConnexTopic.topic0(energy.topics.LogTransfer.getEventSignature())
    .and(energy.topics.LogApprove.getTopicAt(1))
  );

  @AccountEventFilter({
    nameOrAbi: 'Transfer',
    interval: 10_000,
  })
  public getTransfers$(topics: ConnexTopics, options: AccountEventFilterOptions) {
    return (filter: Connex.Thor.Filter<'event'>) => {
      filter.order('asc');

      return filter.apply(0, 5);
    };
  }

  @AccountEventFilter({
    nameOrAbi: 'Transfer',
    address: () => EnergyContractImport.address[ConnexService.chainTag],
  })
  public getTransfers(topics: ConnexTopics, options: AccountEventFilterOptions) {
    return (filter: Connex.Thor.Filter<'event'>) => {
      filter
        .order('asc')
        .range({
          unit: 'block',
          from: fromBlock,
          to
        });

      return filter.apply(0, 5);
    };
  }
```

##### Properties

* `nameOrAbi(abi.Event.Definition | abi.Function.Definition | string)`: ABI definition name or ABI definition. Defaults to method name.
* `address(string)`: Contract address.
* `interval(number)`: Polls event every n seconds.
* `skipIndices`: Skip calling event with indexed arguments.
* `validations(object):` Validate arguments.


#### Blockchain Events
##### @BlockchainEventFilter
Polls an event or transfer. A thunk function  is required which gets a Filter instance. Returns an Observable if interval is used, else a Promise.
```typescript
  @BlockchainEventFilter({
    interval: 10_000,
    kind: 'transfer'
  })
  public getAllTransfers$() {
    return (filter: Connex.Thor.Filter<'transfer'>) => {
      filter.order('asc');

      return filter.apply(0, 5);
    };
  }
```

##### Properties

* `nameOrAbi(abi.Event.Definition | abi.Function.Definition | string)`: ABI definition name or ABI definition. Defaults to method name.
* `kind(string)`: Log type, either 'transfer' or 'event'.


#### Utils
##### getEventSignature
Returns an event signature
```typescript
  energyContract.topics.name.getEventSignature()
```

##### @GetMethodSignature
DEPRECATED

#### RxJS Operators
##### blockConfirmationUntil
Waits until transaction is confirmed
```typescript
    const resp = await token.approve(...);
    const logs: any = await token.approvalLog$([]);
    // creates observable 
    const blockConfirmation = blockConfirmationUntil(resp.txid);

    // once complete, continue with other pipes
    return blockConfirmation
      .pipe(
        switchMap(_ => logs)
      )
      .subscribe(async (i: any) => {
        console.log(i);
      });
```

##### waitForLog
Takes a contract write function promise and an event log function promise and waits until confirmation to return logs back
```typescript
    const approve = token.approve(...);
    const logs: any = token.approvalLog$([]);
    return waitForLog(approve, logs)
      .subscribe((log: any) => { ... });
```


## Best Practices

### Use `vuex-connex-entities` for state management integration
With this plugin you can create contracs in a type safe way without using undocumented `this._vm` inside an action to access `$contractEntities`. 

### Contract entities should be lean
Contract entities helps with working with Connex and Thor, any business logic should be decoupled. 

### Use a shared module to package contract entities
A shared module contains ABI assets and/or contract entities classes for a set of contracts, the shared module can be deployed to npm or a git submodule and linked to one or more projects.

