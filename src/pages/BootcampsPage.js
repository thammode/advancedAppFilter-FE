import {
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Typography,
} from "@material-ui/core";
import { useState, useEffect } from "react";
import axios from "axios";
import BootcampCard from "../components/BootcampCard";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../App";

const useStyles = makeStyles({
  root: {
    marginTop: "20px",
  },
  loader: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  paper: {
    marginBottom: "1rem",
    padding: "13px",
  },
  filters: {
    padding: "0 1.5rem",
  },
  priceRangeInputs: {
    display: "flex",
    justifyContent: "space-between",
  },
});

export const BootcampsPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const params = location.search ? location.search : null;

  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sliderMax, setSliderMax] = useState(1000);
  const [priceRange, setPriceRange] = useState([25, 75]);
  const [priceOrder, setPriceOrder] = useState("descending");

  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState("");

  const updateUIValues = (uiValues) => {
    setSliderMax(uiValues.maxPrice);

    if (uiValues.filtering.price) {
      let priceFilter = uiValues.filtering.price;

      setPriceRange([Number(priceFilter.gte), Number(priceFilter.lte)]);
    }

    if (uiValues.sorting.price) {
      let priceSort = uiValues.sorting.price;
      setPriceOrder(priceSort);
    }
  };

  useEffect(() => {
    let cancel;

    const fetchData = async () => {
      setLoading(true);
      try {
        let query;

        if (params && !filter) {
          query = params;
        } else {
          query = filter;
        }

        if (sorting) {
          if (query.length === 0) {
            query = `?sort=${sorting}`;
          } else {
            query = query + "&sort=" + sorting;
          }
        }

        const { data } = await axios({
          method: "GET",
          url: `${URL}/api/bootcamps${query}`,
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });

        setBootcamps(data.data);
        setLoading(false);
        updateUIValues(data.uiValues);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        console.log(error.response.data);
      }
    };

    fetchData();

    return () => cancel();
  }, [filter, params, sorting]);

  const handlePriceInputChange = (e, type) => {
    let newRange;

    if (type === "lower") {
      newRange = [...priceRange];
      newRange[0] = Number(e.target.value);

      setPriceRange(newRange);
    }

    if (type === "upper") {
      newRange = [...priceRange];
      newRange[1] = Number(e.target.value);

      setPriceRange(newRange);
    }
  };

  const onSliderCommitHandler = (e, newValue) => {
    buildrangeFilter(newValue);
  };

  const onTextFieldCommitHandler = () => {
    buildrangeFilter(priceRange);
  };

  const buildrangeFilter = (newValue) => {
    const urlFilter = `?price[gte]=${newValue[0]}&price[lte]=${newValue[1]}`;

    setFilter(urlFilter);

    navigate(urlFilter);
  };

  const handleSortChange = (e) => {
    setPriceOrder(e.target.value);

    if (e.target.value === "ascending") {
      setSorting("price");
    } else if (e.target.value === "descending") {
      setSorting("-price");
    }
  };

  const clearAllFilters = () => {
    setFilter("");
    setSorting("");
    setPriceRange([0, sliderMax]);
    navigate("/");
  };

  return (
    <Container className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>Filters</Typography>
            <div className={classes.filters}>
              <Slider
                min={0}
                max={sliderMax}
                value={priceRange}
                valueLabelDisplay="auto"
                disabled={loading}
                onChange={(e, newValue) => setPriceRange(newValue)}
                onChangeCommitted={onSliderCommitHandler}
              />
            </div>

            <div className={classes.priceRangeInputs}>
              <TextField
                size="small"
                id="lower"
                label="Min Price"
                variant="outlined"
                type="number"
                disabled={loading}
                value={priceRange[0]}
                onChange={(e) => {
                  handlePriceInputChange(e, "lower");
                }}
                onBlur={onTextFieldCommitHandler}
              />
              <TextField
                size="small"
                id="upper"
                label="Max Price"
                variant="outlined"
                type="number"
                disabled={loading}
                value={priceRange[1]}
                onChange={(e) => {
                  handlePriceInputChange(e, "upper");
                }}
                onBlur={onTextFieldCommitHandler}
              />
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography gutterBottom>Sort by</Typography>
            <FormControl component="fieldset" className={classes.filters}>
              <RadioGroup
                aria-label="price-order"
                name="price-order"
                value={priceOrder}
                onChange={handleSortChange}
              >
                <FormControlLabel
                  value="descending"
                  disabled={loading}
                  control={<Radio />}
                  label="Price: Highest - Lowest"
                />
                <FormControlLabel
                  value="ascending"
                  disabled={loading}
                  control={<Radio />}
                  label="Price: Lowest - Highest"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        <Button size="small" color="primary" onClick={clearAllFilters}>
          Clear All
        </Button>
      </Paper>

      <Grid container spacing={2}>
        {loading ? (
          <div className={classes.loader}>
            <CircularProgress size="3rem" thickness={5} />
          </div>
        ) : (
          bootcamps.map((bootcamp) => (
            <Grid item key={bootcamp._id} xs={12} sm={6} md={4} lg={3}>
              <BootcampCard bootcamp={bootcamp}></BootcampCard>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};
