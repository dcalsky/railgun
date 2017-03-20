Railgun
=============
A simple MVVM framework.

## Usage
```js
new Railgun({
  element: '#app',
  data: {
  	bar: 'hello world',
  	bar1: 'railgun'
  },
  methods: {
    foo: function () {
      this.bar = 'HELLO WORLD'
      this.foo1()
    },
    foo1: function () {
      alert('hello')
    }
  }
})
```

```html
<div id="app">
	<input type="text" n-model="bar" />
	<p>{{bar1}}: {{bar}}</p>
	<button n-on:click="foo">Click me</button>
</div>
<script src="railgun.js"></script>
```


