import { Box, Typography, Slider, Button, Switch, styled } from '@mui/material';

export const Container = styled(Box)({
  minHeight: '100vh',
  background: '#1a1a1a',
  color: '#fff',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  maxWidth: '1400px',
  margin: '0 auto'
});

export const DisplayArea = styled(Box)({
  background: '#000',
  border: '3px solid #333',
  borderRadius: '12px',
  padding: '25px',
  marginBottom: '30px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
});

export const AppTitle = styled(Typography)({
  fontSize: '18px',
  fontWeight: '300',
  color: '#888',
  letterSpacing: '3px',
  fontFamily: 'Arial, sans-serif'
});

export const StatusBadge = styled(Box)({
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 'bold',
  marginBottom: '15px'
});

export const PatchDisplay = styled(Box)({
  background: 'linear-gradient(180deg, #1e5a9e 0%, #0d3d6b 100%)',
  border: '2px solid #2a6bba',
  borderRadius: '6px',
  padding: '20px',
  marginBottom: '20px',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center',
  minHeight: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
});

export const ControlRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
  gap: '12px',
  marginBottom: '15px'
});

export const SmallButton = styled(Button)(({ variant }) => ({
  padding: '10px 8px',
  fontSize: '10px',
  fontWeight: 'bold',
  minWidth: '70px',
  background: variant === 'bank' ? '#8b0000' :
              variant === 'ctrl' ? '#daa520' :
              variant === 'tap' ? '#1e5a9e' : '#006666',
  color: '#fff',
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: '4px',
  '&:hover': {
    background: variant === 'bank' ? '#a52a2a' :
                variant === 'ctrl' ? '#f0c040' :
                variant === 'tap' ? '#2a6bba' : '#008888',
    borderColor: 'rgba(255,255,255,0.4)'
  }
}));

export const Section = styled(Box)({
  background: '#222',
  border: '2px solid #333',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px'
});

export const SectionTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '15px',
  color: '#4a9eff',
  borderBottom: '1px solid #333',
  paddingBottom: '8px'
});

export const KnobsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '20px',
  marginBottom: '20px'
});

export const Knob = styled(Box)({
  textAlign: 'center'
});

export const KnobLabel = styled(Typography)({
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#999',
  marginBottom: '8px',
  textTransform: 'uppercase'
});

export const KnobValue = styled(Typography)({
  fontSize: '14px',
  color: '#fff',
  marginBottom: '5px',
  minHeight: '20px'
});

export const StyledSlider = styled(Slider)({
  color: '#666',
  height: 6,
  '& .MuiSlider-thumb': {
    width: 20,
    height: 20,
    background: 'radial-gradient(circle at 30% 30%, #888, #333)',
    border: '2px solid #555',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(100,100,100,0.16)'
    }
  },
  '& .MuiSlider-track': {
    height: 6,
    borderRadius: 3
  },
  '& .MuiSlider-rail': {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333'
  }
});

export const ModulesGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
  gap: '10px'
});

export const ModuleButton = styled(Button)(({ active }) => ({
  padding: '14px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  background: active === null ? '#444' : active ? '#2d5' : '#222',
  color: active === null ? '#888' : active ? '#fff' : '#666',
  border: active === null ? '2px solid #555' : active ? '2px solid #2d5' : '2px solid #333',
  borderRadius: '6px',
  transition: 'all 0.2s',
  '&:hover': {
    background: active === null ? '#555' : active ? '#3e6' : '#333',
    borderColor: active === null ? '#666' : active ? '#3e6' : '#444'
  }
}));

export const ActionButton = styled(Button)({
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 'bold',
  background: '#444',
  color: '#ccc',
  border: '2px solid #555',
  borderRadius: '6px',
  '&:hover': {
    background: '#555',
    borderColor: '#666',
    color: '#fff'
  }
});

export const ToggleRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
  padding: '10px 15px',
  background: '#2a2a2a',
  borderRadius: '6px',
  border: '1px solid #333'
});

export const ToggleLabel = styled(Typography)({
  fontSize: '12px',
  color: '#aaa'
});

export const StyledSwitch = styled(Switch)(({ state }) => ({
  '& .MuiSwitch-switchBase': {
    color: state === null ? '#666' : '#d44',
    '&.Mui-checked': {
      color: '#1976d2'
    }
  },
  '& .MuiSwitch-track': {
    backgroundColor: state === null ? '#444' : '#a33'
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#195b9a'
  }
}));

export const CompactGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '10px',
  marginTop: '12px'
});
