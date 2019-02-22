### Connex Decorators


A set of Typescript decorators to help with contract services.

#### Contract Class
Maps an ABI to a contract class

```typescript
@ConnexContract({
  import: EnergyContractImport
})
```

#### Contract Methods
##### @GetMethod

Returns a Connex.Thor.VMOutput instance.
```typescript
  @GetMethod({
    nameOrAbi: 'balanceOf',
    address: () => EnergyContractImport.address[ConnexService.chainTag]
  })
  public balanceOfMethod(): any {}
```

##### @CallMethod

Returns a Promise with the result of the VMOutput call execution.
```typescript
  @CallMethod({
    nameOrAbi: 'balanceOf',
    returns: 'decoded',
    address: () => EnergyContractImport.address[ConnexService.chainTag]
  })
  public balanceOf(address: string): any {}
```


#### Contract Events
##### @AccountEventFilter

A contract event filter, it can run once or by polling. A thunk function  is required which gets a Filter instance. Returns an Observable if interval is used, else a Promise.

```typescript
  @AccountEventFilter({
    nameOrAbi: 'Transfer',
    address: () => EnergyContractImport.address[ConnexService.chainTag],
    interval: 10_000,
  })
  public getTransfers$(fromBlock: number, to: number, options: AccountEventFilterOptions) {
    return (filter: Connex.Thor.Filter<'event'>) => {
      filter.order('asc');

      return filter.apply(0, 5);
    };
  }

  @AccountEventFilter({
    nameOrAbi: 'Transfer',
    address: () => EnergyContractImport.address[ConnexService.chainTag],
  })
  public getTransfers(fromBlock: number, to: number, options: AccountEventFilterOptions) {
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
