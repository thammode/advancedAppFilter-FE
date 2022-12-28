import { AppBar, Toolbar, Typography } from "@material-ui/core";

const Navbar = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">My Goodreads</Typography>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
