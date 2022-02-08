export const _permissions = [
  {
    listname: 'Default',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'User',
    Manager: { Read: true, Add: false, Edit: false, Delete: false },
    User: { Read: false, Add: false, Edit: false, Delete: false },
    Viewer: { Read: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Pushnotification',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: false, Edit: false, Delete: true },
    Viewer: { Read: true, Add: false, Edit: false, Delete: true },
  },
  {
    listname: 'Verify',
    Manager: { Read: false, Add: false, Edit: false, Delete: false },
    User: { Read: false, Add: false, Edit: false, Delete: false },
    Viewer: { Read: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Counter',
    Manager: { Read: true, Add: false, Edit: false, Delete: false },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Config',
    Manager: { Read: true, Add: false, Edit: false, Delete: false },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Comment',
    Manager: { Read: true, Add: true, Edit: true, Delete: false },
    User: { Read: true, Add: true, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  /*
    {
      listname: 'Post',
      Manager: { Read: true, Add: true, Edit: true, Delete: true },
      User: { Read: true, Add: false, Edit: false, Delete: false },
      Viewer: { Read: true, Add: false, Edit: false, Delete: false },
    },
    {
      listname: 'Page',
      Manager: { Read: true, Add: true, Edit: true, Delete: true },
      User: { Read: true, Add: false, Edit: false, Delete: false },
      Viewer: { Read: true, Add: false, Edit: false, Delete: false },
    },
    {
      listname: 'Tag',
      Manager: { Read: true, Add: true, Edit: true, Delete: true },
      User: { Read: true, Add: false, Edit: false, Delete: false },
      Viewer: { Read: true, Add: false, Edit: false, Delete: false },
    }, // */
];
