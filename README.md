### Connex Entities


Connex entity contracts allows mapping of contract entities and uses a middleware (Vue plugin) to connect
to Comet and Connex.


### Bootstrapping

#### Adding Contract Entities to plugin middleware
```typescript
Vue.use(ConnexEntityContract, {
    entities: [
      { name: 'Energy', contract: EnergyTokenContract }, 
      { name: 'DBET', contract: DBETVETTokenContract }
    ]
});
```

#### Creating Contract Import
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

#### Create Contract Entity
A contract entity maps to a contract import using the `@ConnexContract` and inherits a `ContractService` instance. An `IConnexContract` interface is required to access this property.

```typescript

@ConnexContract({
  import: EnergyContractImport
})
export class EnergyTokenContract implements IConnexContract {
  contractService: ContractService;
  // ...
}
```

#### Requesting Connex and Comet
When required, request access to the external wallet and middleware will create the contract entities in the Vue instance variable `$contractEntities`.

The following instance variables are available:

* `$requestExternalWalletAccess`: Request access to external wallet
* `$contractEntities`: The contract entities created after external wallet access sucess.
* `$connex`: Access to the static ConnexService

```typescript
  async loginComet() {
    await this.$requestExternalWalletAccess();

    const vthoBalance = await this.$contractEntities.Energy.balanceOf(this.$connex.defaultAccount);
  }
```

### API

#### Contract Class
Maps an ABI to a contract class

```typescript
@ConnexContract({
  import: EnergyContractImport
})
```

#### Contract Methods
##### @GetMethod

Returns a `Connex.Thor.VMOutput` instance.
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
    return (m: Connex.Thor.VMOutput) => {
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
  @AccountEventFilter({
    nameOrAbi: 'Transfer',
    interval: 10_000,
  })
  public getTransfers$(indices: Array<object>, options: AccountEventFilterOptions) {
    return (filter: Connex.Thor.Filter<'event'>) => {
      filter.order('asc');

      return filter.apply(0, 5);
    };
  }

  @AccountEventFilter({
    nameOrAbi: 'Transfer',
    address: () => EnergyContractImport.address[ConnexService.chainTag],
  })
  public getTransfers(indices: Array<object>, options: AccountEventFilterOptions) {
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
