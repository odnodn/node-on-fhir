import React from 'react';
import { makeStyles, Container } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      height: '100%',
      alignItems: 'top',
    },
  },
}));

// interface UnauthenticatedContainerProps {
//   children: React.ReactNode;
// }

export const UnauthenticatedContainer = function({ children }){
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" className={classes.container}>
        {children}
      </Container>
    </div>
  );
};